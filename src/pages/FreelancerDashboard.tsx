import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

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

const FreelancerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Skill filter
    if (selectedSkill) {
      filtered = filtered.filter(project =>
        project.skills.some(skill => 
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );
    }

    // Budget filter
    if (budgetRange) {
      filtered = filtered.filter(project => {
        switch (budgetRange) {
          case 'under-500':
            return project.budget < 500;
          case '500-2000':
            return project.budget >= 500 && project.budget <= 2000;
          case '2000-5000':
            return project.budget >= 2000 && project.budget <= 5000;
          case 'over-5000':
            return project.budget > 5000;
          default:
            return true;
        }
      });
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedSkill, budgetRange]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllSkills = () => {
    const skills = new Set<string>();
    projects.forEach(project => {
      project.skills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Projects</h1>
          <p className="text-gray-600">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Skills</option>
              {getAllSkills().map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>

            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Budgets</option>
              <option value="under-500">Under $500</option>
              <option value="500-2000">$500 - $2,000</option>
              <option value="2000-5000">$2,000 - $5,000</option>
              <option value="over-5000">Over $5,000</option>
            </select>

            <div className="flex items-center text-sm text-gray-500">
              <FunnelIcon className="h-5 w-5 mr-2" />
              {filteredProjects.length} projects found
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;