const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceflow');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

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

    // Create the special demo users for demo login
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

    const additionalClient = new User({
      name: 'Mike Wilson',
      email: 'mike@startup.com',
      password: hashedPassword,
      userType: 'client',
      company: 'StartupXYZ'
    });

    const additionalFreelancer = new User({
      name: 'Emma Davis',
      email: 'emma@freelancer.com',
      password: hashedPassword,
      userType: 'freelancer',
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping']
    });

    await User.insertMany([
      demoClient, 
      demoFreelancer, 
      demoAdmin,
      demoClientDemo,
      demoFreelancerDemo,
      demoAdminDemo,
      additionalClient, 
      additionalFreelancer
    ]);
    console.log('Created demo users');

    // Create demo projects
    const projects = [
      {
        title: 'E-commerce Website Development',
        description: 'We need a modern e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, payment integration, and admin dashboard. We\'re looking for a developer with experience in full-stack development and modern web technologies.',
        budget: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration', 'E-commerce'],
        client: demoClient._id
      },
      {
        title: 'Mobile App UI/UX Design',
        description: 'Looking for a talented UI/UX designer to create a modern, user-friendly design for our fitness tracking mobile app. The design should include onboarding screens, dashboard, workout tracking, progress charts, and user profile sections. We need both iOS and Android designs with a focus on usability and modern aesthetics.',
        budget: 2500,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        skills: ['UI/UX Design', 'Mobile Design', 'Figma', 'Prototyping', 'User Research'],
        client: additionalClient._id
      },
      {
        title: 'WordPress Blog Customization',
        description: 'Need help customizing an existing WordPress blog theme. Tasks include modifying the header design, adding custom post types, implementing a newsletter signup form, optimizing for SEO, and ensuring mobile responsiveness. Experience with WordPress development and PHP is required.',
        budget: 800,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        skills: ['WordPress', 'PHP', 'CSS', 'JavaScript', 'SEO'],
        client: demoClient._id
      },
      {
        title: 'Data Analysis and Visualization Dashboard',
        description: 'We need a data analyst to create an interactive dashboard for our sales data. The project involves cleaning and analyzing large datasets, creating meaningful visualizations, and building an interactive dashboard using tools like Tableau or Power BI. The dashboard should provide insights into sales trends, customer behavior, and performance metrics.',
        budget: 3200,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        skills: ['Data Analysis', 'Tableau', 'Power BI', 'Python', 'SQL'],
        client: additionalClient._id
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Created demo projects');

    // Add some demo bids
    const project1 = createdProjects[0];
    const project2 = createdProjects[1];

    project1.bids.push({
      freelancer: demoFreelancer._id,
      amount: 4500,
      message: 'I have over 5 years of experience in full-stack development with React and Node.js. I\'ve built several e-commerce platforms similar to what you\'re looking for. I can deliver a high-quality, scalable solution within your timeline. My approach includes thorough planning, regular updates, and comprehensive testing to ensure the best results.',
      deliveryTime: 28
    });

    project2.bids.push({
      freelancer: additionalFreelancer._id,
      amount: 2200,
      message: 'As a UI/UX designer with 4+ years of experience in mobile app design, I\'m excited about your fitness app project. I specialize in creating intuitive, user-centered designs that drive engagement. I\'ll provide you with detailed wireframes, high-fidelity mockups, interactive prototypes, and a complete design system. Let\'s create something amazing together!',
      deliveryTime: 18
    });

    await project1.save();
    await project2.save();
    console.log('Added demo bids');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nDemo Accounts:');
    console.log('Client: client@demo.com / password123');
    console.log('Freelancer: freelancer@demo.com / password123');
    console.log('\nAdditional Accounts:');
    console.log('Client: mike@startup.com / password123');
    console.log('Freelancer: emma@freelancer.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();