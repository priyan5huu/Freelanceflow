import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (userType: 'client' | 'freelancer' | 'admin') => {
    try {
      await loginDemo(userType);
      if (userType === 'admin') {
        navigate('/admin');
      } else if (userType === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const features = [
    {
      icon: BriefcaseIcon,
      title: 'Post Projects',
      description: 'Describe your project requirements and get proposals from qualified freelancers worldwide.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Find Expert Talent',
      description: 'Browse through thousands of skilled professionals ready to bring your vision to life.',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Secure Payments',
      description: 'Pay with confidence using our secure payment system with milestone-based releases.',
      gradient: 'from-accent-500 to-accent-600'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Projects Completed', icon: TrophyIcon },
    { number: '5M+', label: 'Active Freelancers', icon: UserGroupIcon },
    { number: '99.9%', label: 'Uptime Guarantee', icon: ClockIcon },
    { number: '4.9/5', label: 'Client Satisfaction', icon: StarIcon }
  ];

  const benefits = [
    'Access to global talent pool',
    'Competitive pricing',
    'Quality assurance',
    'Secure transactions',
    'Project management tools',
    '24/7 customer support'
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TechStart',
      image: '/api/placeholder/64/64',
      quote: 'FreelanceFlow helped us find amazing developers who completed our MVP in record time. The quality exceeded our expectations.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Marketing Director',
      image: '/api/placeholder/64/64',
      quote: 'The platform made it so easy to find and hire the right freelancers. Our project was delivered on time and on budget.',
      rating: 5
    },
    {
      name: 'Elena Volkov',
      role: 'Freelance Designer',
      image: '/api/placeholder/64/64',
      quote: 'As a freelancer, I love how easy it is to find quality clients and get paid securely. FreelanceFlow is my go-to platform.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar showAuthButtons={true} />
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-150"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-300"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 text-primary-700 text-sm font-semibold mb-8 shadow-lg"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Trusted by 10M+ professionals worldwide
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-display font-bold text-neutral-900 mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Find the Perfect
              <span className="gradient-text block">Freelance Services</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect with top-rated freelancers and agencies to get your projects done faster, 
              better, and at the right price. From web development to design, we've got you covered.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link to="/signup" className="btn-primary text-lg px-10 py-4">
                Get Started Today
                <ArrowRightIcon className="ml-3 h-6 w-6" />
              </Link>
              <button className="btn-secondary text-lg px-10 py-4 group">
                <PlayIcon className="mr-3 h-6 w-6 group-hover:text-primary-600 transition-colors duration-200" />
                Watch Demo
              </button>
            </motion.div>

            {/* Demo Login Section */}
            <motion.div 
              className="card-premium p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                Try our platform with demo accounts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleDemoLogin('client')}
                  className="btn-ghost py-3 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200"
                >
                  Demo Client
                </button>
                <button
                  onClick={() => handleDemoLogin('freelancer')}
                  className="btn-ghost py-3 hover:bg-secondary-50 hover:text-secondary-700 hover:border-secondary-200"
                >
                  Demo Freelancer
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="btn-ghost py-3 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-200"
                >
                  Demo Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Everything you need to
              <span className="gradient-text block">succeed</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our platform provides all the tools and features you need to find talent, 
              manage projects, and grow your business.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
                Why choose
                <span className="block">FreelanceFlow?</span>
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Join millions of businesses and freelancers who trust our platform 
                to deliver exceptional results.
              </p>
              <Link to="/signup" className="btn-secondary">
                Start Your Journey
                <ArrowRightIcon className="ml-3 h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-accent-400" />
                  </div>
                  <span className="text-lg text-primary-100 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Loved by professionals
              <span className="gradient-text block">worldwide</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="card-premium p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-accent-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-neutral-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-neutral-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join FreelanceFlow today and connect with talented professionals 
              or find your next great opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/signup" className="btn-secondary text-lg px-10 py-4">
                Join as Client
              </Link>
              <Link to="/signup" className="btn-ghost text-lg px-10 py-4 text-white border-white hover:bg-white hover:text-neutral-900">
                Join as Freelancer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <BriefcaseIcon className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-display font-bold">FreelanceFlow</span>
              </div>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
                The world's leading platform for finding and hiring talented freelancers. 
                Build your business with confidence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6">Platform</h3>
              <ul className="space-y-4 text-neutral-400">
                <li><Link to="/browse" className="hover:text-white transition-colors duration-200">Browse Projects</Link></li>
                <li><Link to="/freelancers" className="hover:text-white transition-colors duration-200">Find Freelancers</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors duration-200">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6">Support</h3>
              <ul className="space-y-4 text-neutral-400">
                <li><Link to="/help" className="hover:text-white transition-colors duration-200">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 FreelanceFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
