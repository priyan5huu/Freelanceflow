import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  TagIcon,
  UserIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  BuildingOfficeIcon
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

interface ProjectCardProps {
  project: Project;
  showBidButton?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showBidButton = true }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = () => {
    if (daysUntilDeadline <= 3) return 'text-red-600 bg-red-50';
    if (daysUntilDeadline <= 7) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getBidStatus = () => {
    const bidCount = project.bids.length;
    if (bidCount === 0) return { text: 'No proposals yet', color: 'text-neutral-500 bg-neutral-100' };
    if (bidCount <= 3) return { text: `${bidCount} proposal${bidCount > 1 ? 's' : ''}`, color: 'text-blue-600 bg-blue-50' };
    return { text: `${bidCount} proposals`, color: 'text-green-600 bg-green-50' };
  };

  return (
    <motion.div 
      className="card-premium p-8 group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-display font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 leading-tight">
              {project.title}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor()}`}>
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBidStatus().color}`}>
                {getBidStatus().text}
              </span>
            </div>
          </div>

          <p className="text-neutral-600 text-lg leading-relaxed mb-6 line-clamp-3">
            {project.description}
          </p>

          {/* Client Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-neutral-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-neutral-900">{project.client.name}</span>
                {project.client.company && (
                  <>
                    <BuildingOfficeIcon className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{project.client.company}</span>
                  </>
                )}
              </div>
              <span className="text-sm text-neutral-500">Posted {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-primary-700">Budget</div>
            <div className="text-xl font-bold text-primary-900">${project.budget.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-xl">
          <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-secondary-700">Deadline</div>
            <div className="text-lg font-bold text-secondary-900">{formatDate(project.deadline)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-accent-50 rounded-xl">
          <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftIcon className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-accent-700">Proposals</div>
            <div className="text-xl font-bold text-accent-900">{project.bids.length}</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {project.skills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TagIcon className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Required Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 6 && (
              <span className="px-3 py-1 text-sm font-medium text-neutral-500 bg-neutral-100 rounded-lg">
                +{project.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
        <Link
          to={`/projects/${project._id}`}
          className="btn-primary flex-1 justify-center"
        >
          <EyeIcon className="h-5 w-5 mr-2" />
          View Details
        </Link>
        
        {showBidButton && project.bids.length > 0 && (
          <Link
            to={`/projects/${project._id}#proposals`}
            className="btn-secondary flex-1 justify-center"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
            View Proposals ({project.bids.length})
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
