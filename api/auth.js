// Vercel serverless function for authentication
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock demo users (for immediate testing without MongoDB)
const DEMO_USERS = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo Client',
    email: 'client@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hM8AhPJW6', // password123
    userType: 'client',
    company: 'Demo Company Inc.',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439012', 
    name: 'Demo Freelancer',
    email: 'freelancer@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hM8AhPJW6', // password123
    userType: 'freelancer',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Demo Admin', 
    email: 'admin@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hM8AhPJW6', // password123
    userType: 'admin',
    isActive: true
  }
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'freelanceflow-demo-secret-key-2025',
    { expiresIn: '7d' }
  );
};

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
    if (req.method === 'GET') {
      // Health check
      return res.json({
        status: 'healthy',
        database: 'mock',
        totalUsers: DEMO_USERS.length,
        demoAccounts: {
          client: 'exists',
          freelancer: 'exists',
          admin: 'exists'
        },
        timestamp: new Date().toISOString(),
        message: 'Demo API is working! Ready for client demonstrations.'
      });
    }

    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user in mock data
      const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(400).json({ message: 'Account is deactivated' });
      }

      // Check password (for demo, we know password is 'password123')
      if (password !== 'password123') {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

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
