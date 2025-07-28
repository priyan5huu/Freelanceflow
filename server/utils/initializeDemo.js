const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

const initializeDemoData = async () => {
  try {
    // Check if demo users already exist
    const existingDemoClient = await User.findOne({ email: 'client@demo.com' });
    if (existingDemoClient) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    console.log('Initializing demo data...');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const demoClient = new User({
      name: 'John Smith',
      email: 'client@demo.com',
      password: hashedPassword,
      userType: 'client',
      company: 'TechCorp Inc.'
    });

    const demoFreelancer = new User({
      name: 'Sarah Johnson',
      email: 'freelancer@demo.com',
      password: hashedPassword,
      userType: 'freelancer',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript']
    });

    const demoAdmin = new User({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: hashedPassword,
      userType: 'admin'
    });

    // Create the special demo users for demo login API
    const demoClientDemo = new User({
      name: 'Demo Client',
      email: 'demo-client@freelanceflow.com',
      password: await bcrypt.hash('demo123456', 12),
      userType: 'client',
      company: 'Demo Company Inc.'
    });

    const demoFreelancerDemo = new User({
      name: 'Demo Freelancer',
      email: 'demo-freelancer@freelanceflow.com',
      password: await bcrypt.hash('demo123456', 12),
      userType: 'freelancer',
      skills: ['JavaScript', 'React', 'Node.js', 'UI/UX Design']
    });

    const demoAdminDemo = new User({
      name: 'Demo Admin',
      email: 'demo-admin@freelanceflow.com',
      password: await bcrypt.hash('demo123456', 12),
      userType: 'admin'
    });

    await User.insertMany([
      demoClient, 
      demoFreelancer, 
      demoAdmin,
      demoClientDemo,
      demoFreelancerDemo,
      demoAdminDemo
    ]);

    // Create demo projects
    const projects = [
      {
        title: 'E-commerce Website Development',
        description: 'We need a modern e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
        budget: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration', 'E-commerce'],
        client: demoClient._id
      },
      {
        title: 'Mobile App UI/UX Design',
        description: 'Looking for a talented UI/UX designer to create a modern, user-friendly design for our fitness tracking mobile app.',
        budget: 2500,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        skills: ['UI/UX Design', 'Mobile Design', 'Figma', 'Prototyping'],
        client: demoClient._id
      }
    ];

    const createdProjects = await Project.insertMany(projects);

    // Add demo bids
    const project1 = createdProjects[0];
    project1.bids.push({
      freelancer: demoFreelancer._id,
      amount: 4500,
      message: 'I have over 5 years of experience in full-stack development with React and Node.js. I can deliver a high-quality, scalable solution within your timeline.',
      deliveryTime: 28
    });

    await project1.save();

    console.log('✅ Demo data initialized successfully');
    console.log('Demo Accounts:');
    console.log('- Client: client@demo.com / password123');
    console.log('- Freelancer: freelancer@demo.com / password123');
    console.log('- Admin: admin@demo.com / password123');
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
  }
};

module.exports = initializeDemoData;
