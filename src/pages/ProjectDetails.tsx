import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import BidForm from '../components/BidForm';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ClockIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  client: {
    _id: string;
    name: string;
    company?: string;
  };
  bids: Bid[];
  createdAt: string;
}

interface Bid {
  _id: string;
  freelancer: {
    _id: string;
    name: string;
    skills?: string[];
  };
  amount: number;
  message: string;
  deliveryTime: number;
  createdAt: string;
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [userHasBid, setUserHasBid] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
      setProject(response.data.project);
      
      // Check if current user has already bid
      if (user && user.userType === 'freelancer') {
        const hasBid = response.data.project.bids.some(
          (bid: Bid) => bid.freelancer._id === user.id
        );
        setUserHasBid(hasBid);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmitted = () => {
    fetchProject();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysUntilDeadline = project ? Math.ceil(
    (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.client._id;
  const canBid = user?.userType === 'freelancer' && !isOwner && !userHasBid;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>{project.client.name}</span>
                  {project.client.company && (
                    <span className="ml-1">• {project.client.company}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Posted {formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>
                    {daysUntilDeadline > 0 
                      ? `${daysUntilDeadline} days left`
                      : 'Deadline passed'
                    }
                  </span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bids Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Proposals ({project.bids.length})
                </h2>
                {canBid && (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Submit Proposal
                  </button>
                )}
              </div>

              {project.bids.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to submit a proposal for this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.bids.map((bid) => (
                    <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{bid.freelancer.name}</h4>
                          {bid.freelancer.skills && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {bid.freelancer.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${bid.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bid.deliveryTime} days delivery
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{bid.message}</p>
                      <div className="text-xs text-gray-500">
                        Submitted {formatDate(bid.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${project.budget.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Project Budget</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deadline:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(project.deadline)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Proposals:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {project.bids.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posted:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>

              {canBid && (
                <button
                  onClick={() => setShowBidForm(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                >
                  Submit Proposal
                </button>
              )}

              {userHasBid && (
                <div className="w-full bg-green-100 text-green-800 font-medium py-3 px-4 rounded-md text-center">
                  Proposal Submitted
                </div>
              )}

              {isOwner && (
                <div className="w-full bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-md text-center">
                  Your Project
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBidForm && (
        <BidForm
          projectId={project._id}
          onClose={() => setShowBidForm(false)}
          onBidSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  );
};

export default ProjectDetails;