const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 100, max: 5000 })
    .withMessage('Description must be between 100 and 5000 characters'),
  body('budget')
    .isNumeric()
    .isFloat({ min: 50 })
    .withMessage('Budget must be at least $50'),
  body('deadline')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required')
    .custom((skills) => {
      if (!skills.every(skill => typeof skill === 'string' && skill.trim().length > 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      return true;
    })
];

const bidValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Bid amount must be at least $1'),
  body('message')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Message must be between 50 and 2000 characters'),
  body('deliveryTime')
    .isInt({ min: 1 })
    .withMessage('Delivery time must be at least 1 day')
];

// @route   GET /api/projects
// @desc    Get all active projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      skills,
      minBudget,
      maxBudget,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'open', isActive: true };

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillsArray };
    }

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = parseFloat(minBudget);
      if (maxBudget) filter.budget.$lte = parseFloat(maxBudget);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate('client', 'name company')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// @route   GET /api/projects/my-projects
// @desc    Get current user's projects (clients only)
// @access  Private (Client)
router.get('/my-projects', auth, authorize('client'), async (req, res) => {
  try {
    const projects = await Project.find({ 
      client: req.user._id,
      isActive: true 
    })
      .populate('client', 'name company')
      .populate('bids.freelancer', 'name skills')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Server error while fetching your projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid project ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('client', 'name company')
      .populate('bids.freelancer', 'name skills')
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Client)
router.post('/', [
  auth,
  authorize('client'),
  ...projectValidation
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, budget, deadline, skills } = req.body;

    const project = new Project({
      title,
      description,
      budget,
      deadline: new Date(deadline),
      skills: skills.map(skill => skill.trim()),
      client: req.user._id
    });

    await project.save();
    await project.populate('client', 'name company');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
});

// @route   POST /api/projects/:id/bids
// @desc    Submit a bid for a project
// @access  Private (Freelancer)
router.post('/:id/bids', [
  auth,
  authorize('freelancer'),
  param('id').isMongoId().withMessage('Invalid project ID'),
  ...bidValidation
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, message, deliveryTime } = req.body;
    const projectId = req.params.id;
    const freelancerId = req.user._id;

    // Find the project
    const project = await Project.findOne({
      _id: projectId,
      status: 'open',
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not accepting bids' });
    }

    // Check if freelancer is the project owner
    if (project.client.toString() === freelancerId.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own project' });
    }

    // Check if freelancer has already bid
    const existingBid = project.bids.find(
      bid => bid.freelancer.toString() === freelancerId.toString()
    );

    if (existingBid) {
      return res.status(400).json({ message: 'You have already submitted a bid for this project' });
    }

    // Add the bid
    const newBid = {
      freelancer: freelancerId,
      amount,
      message,
      deliveryTime
    };

    project.bids.push(newBid);
    await project.save();

    // Populate the new bid for response
    await project.populate('bids.freelancer', 'name skills');

    const addedBid = project.bids[project.bids.length - 1];

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid: addedBid
    });
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ message: 'Server error while submitting bid' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Client - Owner only)
router.put('/:id', [
  auth,
  authorize('client'),
  param('id').isMongoId().withMessage('Invalid project ID'),
  ...projectValidation
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, budget, deadline, skills } = req.body;
    const projectId = req.params.id;

    const project = await Project.findOne({
      _id: projectId,
      client: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Update project fields
    project.title = title;
    project.description = description;
    project.budget = budget;
    project.deadline = new Date(deadline);
    project.skills = skills.map(skill => skill.trim());

    await project.save();
    await project.populate('client', 'name company');

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (soft delete)
// @access  Private (Client - Owner only)
router.delete('/:id', [
  auth,
  authorize('client'),
  param('id').isMongoId().withMessage('Invalid project ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      client: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Soft delete
    project.isActive = false;
    await project.save();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
});

module.exports = router;