const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  console.log('Admin auth check - User:', req.user?.name, 'Type:', req.user?.userType);
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers, 
      totalProjects, 
      activeUsers, 
      pendingProjects,
      completedProjects,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      User.countDocuments({ isActive: true }),
      Project.countDocuments({ status: 'open' }),
      Project.countDocuments({ status: 'completed' }),
      Project.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$budget' } } }
      ])
    ]);

    // Calculate additional metrics
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      }
    });

    const averageProjectBudget = await Project.aggregate([
      { $group: { _id: null, avg: { $avg: '$budget' } } }
    ]);

    res.json({
      totalUsers,
      totalProjects,
      activeUsers,
      pendingProjects,
      totalRevenue: totalRevenue[0]?.total || 0,
      completedProjects,
      newUsersThisMonth,
      averageProjectValue: Math.round(averageProjectBudget[0]?.avg || 0)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id
// @desc    Update user status or details
// @access  Private (Admin only)
router.patch('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/bulk-action
// @desc    Perform bulk actions on users
// @access  Private (Admin only)
router.post('/users/bulk-action', auth, adminAuth, async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    let updateObj = {};
    switch (action) {
      case 'activate':
        updateObj = { isActive: true };
        break;
      case 'deactivate':
        updateObj = { isActive: false };
        break;
      case 'delete':
        await User.deleteMany({ _id: { $in: userIds } });
        return res.json({ message: `${userIds.length} users deleted successfully` });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateObj
    );

    res.json({ 
      message: `${result.modifiedCount} users ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/bulk (alternate endpoint for compatibility)
// @desc    Perform bulk actions on users  
// @access  Private (Admin only)
router.post('/users/bulk', auth, adminAuth, async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    let updateObj = {};
    switch (action) {
      case 'activate':
        updateObj = { isActive: true };
        break;
      case 'deactivate':
        updateObj = { isActive: false };
        break;
      case 'delete':
        await User.deleteMany({ _id: { $in: userIds } });
        return res.json({ message: `${userIds.length} users deleted successfully` });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateObj
    );

    res.json({ 
      message: `${result.modifiedCount} users ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects with filtering and pagination
// @access  Private (Admin only)
router.get('/projects', auth, adminAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/projects/:id
// @desc    Update project details
// @access  Private (Admin only)
router.patch('/projects/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate('client', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/projects/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/projects/bulk-action
// @desc    Perform bulk actions on projects
// @access  Private (Admin only)
router.post('/projects/bulk-action', auth, adminAuth, async (req, res) => {
  try {
    const { projectIds, action } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'Project IDs are required' });
    }

    let updateObj = {};
    switch (action) {
      case 'feature':
        updateObj = { featured: true };
        break;
      case 'archive':
        updateObj = { status: 'archived' };
        break;
      case 'delete':
        await Project.deleteMany({ _id: { $in: projectIds } });
        return res.json({ message: `${projectIds.length} projects deleted successfully` });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      updateObj
    );

    res.json({ 
      message: `${result.modifiedCount} projects ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/projects/bulk (alternate endpoint for compatibility)
// @desc    Perform bulk actions on projects
// @access  Private (Admin only)
router.patch('/projects/bulk', auth, adminAuth, async (req, res) => {
  try {
    const { projectIds, action } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'Project IDs are required' });
    }

    let updateObj = {};
    switch (action) {
      case 'feature':
        updateObj = { featured: true };
        break;
      case 'archive':
        updateObj = { status: 'archived' };
        break;
      case 'delete':
        await Project.deleteMany({ _id: { $in: projectIds } });
        return res.json({ message: `${projectIds.length} projects deleted successfully` });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      updateObj
    );

    res.json({ 
      message: `${result.modifiedCount} projects ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/projects/bulk
// @desc    Delete multiple projects
// @access  Private (Admin only)
router.delete('/projects/bulk', auth, adminAuth, async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'Project IDs are required' });
    }

    await Project.deleteMany({ _id: { $in: projectIds } });
    res.json({ message: `${projectIds.length} projects deleted successfully` });
  } catch (error) {
    console.error('Error deleting projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Calculate date range based on timeRange
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get user registration stats
    const userStats = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            userType: '$userType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Get project stats by status
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]);

    res.json({
      userStats,
      projectStats,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/activity
// @desc    Get activity logs
// @access  Private (Admin only)
router.get('/activity', auth, adminAuth, async (req, res) => {
  try {
    // Mock activity logs for now - you can implement a real activity logging system
    const mockLogs = [
      {
        _id: '1',
        action: 'User Registration',
        user: 'System',
        details: 'New freelancer registered: john.doe@example.com',
        timestamp: '2024-01-15 10:30:00',
        type: 'user'
      },
      {
        _id: '2',
        action: 'Project Created',
        user: 'Admin',
        details: 'New project "E-commerce Website" approved',
        timestamp: '2024-01-15 09:15:00',
        type: 'project'
      },
      {
        _id: '3',
        action: 'System Update',
        user: 'System',
        details: 'Platform fee updated to 10%',
        timestamp: '2024-01-14 16:45:00',
        type: 'system'
      },
      {
        _id: '4',
        action: 'Admin Action',
        user: 'Admin',
        details: 'Bulk user activation performed',
        timestamp: '2024-01-14 14:20:00',
        type: 'admin'
      }
    ];

    res.json(mockLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get platform settings
// @access  Private (Admin only)
router.get('/settings', auth, adminAuth, async (req, res) => {
  try {
    // Mock settings - you can implement a Settings model
    const mockSettings = {
      platformFee: 10,
      maxProjectBudget: 100000,
      minProjectBudget: 50,
      allowNewRegistrations: true,
      maintenanceMode: false,
      emailNotifications: true
    };

    res.json(mockSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/platform-settings
// @desc    Update platform settings
// @access  Private (Admin only)
router.put('/platform-settings', auth, adminAuth, async (req, res) => {
  try {
    const { platformSettings, securitySettings } = req.body;
    
    // In a real implementation, you would save these to a Settings model
    console.log('Platform settings updated:', { platformSettings, securitySettings });
    
    res.json({ 
      message: 'Settings updated successfully',
      platformSettings,
      securitySettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/export/:type
// @desc    Export data as CSV
// @access  Private (Admin only)
router.get('/export/:type', auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type === 'users') {
      const users = await User.find().select('-password');
      
      // Convert to CSV format
      const csvHeader = 'Name,Email,User Type,Status,Created At\n';
      const csvData = users.map(user => 
        `"${user.name}","${user.email}","${user.userType}","${user.isActive ? 'Active' : 'Inactive'}","${user.createdAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
      
    } else if (type === 'projects') {
      const projects = await Project.find().populate('client', 'name email');
      
      const csvHeader = 'Title,Description,Budget,Status,Client,Created At\n';
      const csvData = projects.map(project => 
        `"${project.title}","${project.description}","${project.budget}","${project.status}","${project.client?.name || 'Unknown'}","${project.createdAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
      
    } else {
      res.status(400).json({ message: 'Invalid export type' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
