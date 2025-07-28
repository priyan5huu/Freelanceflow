const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid amount must be at least $1']
  },
  message: {
    type: String,
    required: [true, 'Proposal message is required'],
    minlength: [50, 'Message must be at least 50 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Delivery time is required'],
    min: [1, 'Delivery time must be at least 1 day']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    minlength: [100, 'Description must be at least 100 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [50, 'Budget must be at least $50']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bids: [bidSchema],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled', 'archived'],
    default: 'open'
  },
  selectedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ client: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ budget: 1 });
projectSchema.index({ deadline: 1 });

// Virtual for bid count
projectSchema.virtual('bidCount').get(function() {
  return this.bids.length;
});

// Ensure virtuals are included in JSON output
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);