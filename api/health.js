// Health check endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.json({
      status: 'healthy',
      message: '🚀 FreelanceFlow Demo API is working!',
      endpoints: {
        login: '/api/auth/login',
        health: '/api/health'
      },
      demoAccounts: [
        { email: 'client@demo.com', password: 'password123', type: 'client' },
        { email: 'freelancer@demo.com', password: 'password123', type: 'freelancer' },
        { email: 'admin@demo.com', password: 'password123', type: 'admin' }
      ],
      timestamp: new Date().toISOString()
    });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
