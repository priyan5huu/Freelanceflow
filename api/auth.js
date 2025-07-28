// Vercel serverless function for authentication
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceflow';
  
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// User Schema (inline for serverless)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  company: String,
  skills: [String],
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
};

// Initialize demo data
async function initializeDemoData() {
  try {
    const existingClient = await User.findOne({ email: 'client@demo.com' });
    if (existingClient) return;

    const hashedPassword = await bcrypt.hash('password123', 12);

    const demoUsers = [
      {
        name: 'Demo Client',
        email: 'client@demo.com',
        password: hashedPassword,
        userType: 'client',
        company: 'Demo Company Inc.'
      },
      {
        name: 'Demo Freelancer',
        email: 'freelancer@demo.com',
        password: hashedPassword,
        userType: 'freelancer',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript']
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        userType: 'admin'
      }
    ];

    await User.insertMany(demoUsers);
    console.log('Demo data initialized');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDatabase();
    await initializeDemoData();

    if (req.method === 'GET') {
      // Health check
      const userCount = await User.countDocuments();
      const demoClient = await User.findOne({ email: 'client@demo.com' });
      const demoFreelancer = await User.findOne({ email: 'freelancer@demo.com' });
      
      return res.json({
        status: 'healthy',
        database: 'connected',
        totalUsers: userCount,
        demoAccounts: {
          client: demoClient ? 'exists' : 'missing',
          freelancer: demoFreelancer ? 'exists' : 'missing'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          company: user.company,
          skills: user.skills
        }
      });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
