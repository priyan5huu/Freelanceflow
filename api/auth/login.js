// Vercel serverless function for login
const jwt = require('jsonwebtoken');

// Mock demo users (works instantly without database)
const DEMO_USERS = [
  {
    id: '507f1f77bcf86cd799439011',
    name: 'Demo Client',
    email: 'client@demo.com',
    userType: 'client',
    company: 'Demo Company Inc.'
  },
  {
    id: '507f1f77bcf86cd799439012', 
    name: 'Demo Freelancer',
    email: 'freelancer@demo.com',
    userType: 'freelancer',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript']
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Demo Admin', 
    email: 'admin@demo.com',
    userType: 'admin'
  }
];

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'freelanceflow-demo-secret-key-2025',
    { expiresIn: '7d' }
  );
};

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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

    // Check password (for demo, accept 'password123')
    if (password !== 'password123') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        company: user.company,
        skills: user.skills
      }
    });
  }

  if (req.method === 'GET') {
    // Health check
    return res.json({
      status: 'healthy',
      message: 'Demo login API is working!',
      demoAccounts: {
        client: 'client@demo.com',
        freelancer: 'freelancer@demo.com',
        password: 'password123'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
