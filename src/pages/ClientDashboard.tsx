import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  FolderOpenIcon, 
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  client: {
    name: string;
    company?: string;
  };
  bids: {
    _id: string;
    freelancer: string;
    amount: number;
    proposal: string;
    createdAt: string;
  }[];
  createdAt: string;
}

const ClientDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/my-projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    setShowProjectForm(false);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && project.bids.length > 0) ||
                         (filterStatus === 'pending' && project.bids.length === 0);
    return matchesSearch && matchesFilter;
  });

  const totalBids = projects.reduce((sum, project) => sum + project.bids.length, 0);
  const activeProjects = projects.filter(p => p.bids.length > 0).length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: BriefcaseIcon,
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: ClockIcon,
      color: 'secondary',
      change: '+8%'
    },
    {
      title: 'Total Proposals',
      value: totalBids,
      icon: UserGroupIcon,
      color: 'accent',
      change: '+25%'
    },
    {
      title: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'primary',
      change: '+15%'
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
                Welcome back! 👋
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl">
                Manage your projects, review proposals, and track progress all in one place.
              </p>
            </div>
            <motion.button
              onClick={() => setShowProjectForm(true)}
              className="btn-primary mt-6 lg:mt-0 text-lg px-8 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="h-6 w-6 mr-3" />
              Post New Project
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                className="card-premium p-6 hover:shadow-glow transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-display font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-neutral-600 font-medium">{stat.title}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="card-premium p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-12 w-full"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-premium pl-12 pr-10 appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Projects</option>
                <option value="active">Active Projects</option>
                <option value="pending">Pending Projects</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FolderOpenIcon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-4">
                  {searchTerm || filterStatus !== 'all' ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-lg text-neutral-600 mb-8">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first project to start receiving proposals from talented freelancers.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    <PlusIcon className="h-6 w-6 mr-3" />
                    Post Your First Project
                  </button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-neutral-900">
                  Your Projects ({filteredProjects.length})
                </h2>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <EyeIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {filteredProjects.length} of {projects.length} projects
                  </span>
                </div>
              </div>

              <div className="grid gap-6">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProjectForm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectForm 
                onClose={() => setShowProjectForm(false)}
                onProjectCreated={handleProjectCreated}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;