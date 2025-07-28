import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BellIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  activeUsers: number;
  pendingProjects: number;
  totalRevenue: number;
  completedProjects: number;
  newUsersThisMonth: number;
  averageProjectValue: number;
}

interface SystemSettings {
  platformFee: number;
  maxProjectBudget: number;
  minProjectBudget: number;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

interface ActivityLog {
  _id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  type: 'user' | 'project' | 'system' | 'admin';
}

interface AnalyticsData {
  userStats: Array<{
    _id: {
      year: number;
      month: number;
      userType: string;
    };
    count: number;
  }>;
  projectStats: Array<{
    _id: string;
    count: number;
    totalBudget: number;
  }>;
  timeRange: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    activeUsers: 0,
    pendingProjects: 0,
    totalRevenue: 0,
    completedProjects: 0,
    newUsersThisMonth: 0,
    averageProjectValue: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    platformFee: 10,
    maxProjectBudget: 100000,
    minProjectBudget: 50,
    allowNewRegistrations: true,
    maintenanceMode: false,
    emailNotifications: true
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'settings' | 'activity' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showProjectBulkActions, setShowProjectBulkActions] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'archived'>('all');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [platformSettings, setPlatformSettings] = useState({
    feePercentage: 10,
    minProjectBudget: 50,
    autoApproveProjects: true
  });
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 60
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user?.userType === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const [statsRes, usersRes, projectsRes, settingsRes, activityRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/projects', config),
        axios.get('http://localhost:5000/api/admin/settings', config).catch(() => ({ data: settings })),
        axios.get('http://localhost:5000/api/admin/activity', config).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setSettings(settingsRes.data);
      setActivityLogs(activityRes.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.patch(`http://localhost:5000/api/admin/users/${userId}`, {
        isActive: !isActive
      }, config);
      
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !isActive } : u
      ));
      
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(`http://localhost:5000/api/admin/projects/${projectId}`, config);
      
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleBulkUserAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.post('http://localhost:5000/api/admin/users/bulk', {
        userIds: selectedUsers,
        action
      }, config);

      if (action === 'delete') {
        setUsers(users.filter(u => !selectedUsers.includes(u._id)));
      } else {
        setUsers(users.map(u => 
          selectedUsers.includes(u._id) 
            ? { ...u, isActive: action === 'activate' }
            : u
        ));
      }

      setSelectedUsers([]);
      setShowBulkActions(false);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} users`);
    }
  };

  const exportData = async (type: 'users' | 'projects') => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' as const
      };

      const response = await axios.get(`http://localhost:5000/api/admin/export/${type}`, config);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${type} data`);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = projectStatusFilter === 'all' || project.status === projectStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleBulkProjectAction = async (action: 'feature' | 'archive' | 'delete') => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (action === 'delete') {
        await axios.delete('http://localhost:5000/api/admin/projects/bulk', {
          ...config,
          data: { projectIds: selectedProjects }
        });
        setProjects(projects.filter(p => !selectedProjects.includes(p._id)));
      } else {
        await axios.patch('http://localhost:5000/api/admin/projects/bulk', {
          projectIds: selectedProjects,
          action
        }, config);
        
        // Update local state based on action
        if (action === 'archive') {
          setProjects(projects.map(p => 
            selectedProjects.includes(p._id) 
              ? { ...p, status: 'archived' }
              : p
          ));
        }
      }

      setSelectedProjects([]);
      setShowProjectBulkActions(false);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} projects`);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put('http://localhost:5000/api/admin/platform-settings', {
        platformSettings,
        securitySettings
      }, config);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const fetchAnalyticsData = async (timeRange: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.get(`http://localhost:5000/api/admin/analytics?timeRange=${timeRange}`, config);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData(analyticsTimeRange);
    }
  }, [activeTab, analyticsTimeRange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToMainSite = () => {
    navigate('/');
  };

  if (user?.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ComponentType<any>; 
    color: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    prefix?: string;
  }> = ({ title, value, icon: Icon, color, change, changeType, prefix = '' }) => (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {prefix}{value.toLocaleString()}
              </p>
            </div>
          </div>
          {change && (
            <div className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className={`inline-flex items-center ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↗' : '↘'} {change}
              </span>
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Back button and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={goToMainSite}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="hidden sm:block h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="hidden sm:block text-sm text-gray-600">Manage users, projects, and platform settings</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Right side - User menu and actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    activeTab === 'users' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <UsersIcon className="h-4 w-4 mr-1" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    activeTab === 'projects' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    activeTab === 'analytics' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Analytics
                </button>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {/* Desktop Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <button
                        onClick={goToMainSite}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Go to Main Site
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowUserDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <CogIcon className="h-4 w-4 mr-2" />
                        Admin Settings
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        role="menuitem"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Navigation */}
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'overview' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'users' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'projects' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'analytics' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'settings' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setActiveTab('activity');
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    activeTab === 'activity' 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Activity Log
                </button>
                
                {/* Mobile User Actions */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center px-3 py-2">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">Administrator</p>
                    </div>
                  </div>
                  <button
                    onClick={goToMainSite}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    Go to Main Site
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation - Desktop */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'users', name: 'Users', icon: UsersIcon },
              { id: 'projects', name: 'Projects', icon: BriefcaseIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
              { id: 'activity', name: 'Activity Log', icon: ClipboardDocumentListIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UsersIcon}
            color="bg-blue-500"
            change="+12%"
            changeType="increase"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={BriefcaseIcon}
            color="bg-green-500"
            change="+8%"
            changeType="increase"
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={CurrencyDollarIcon}
            color="bg-purple-500"
            change="+15%"
            changeType="increase"
            prefix="$"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={ChartBarIcon}
            color="bg-orange-500"
            change="-2%"
            changeType="decrease"
          />
          <StatCard
            title="Completed Projects"
            value={stats.completedProjects}
            icon={CheckCircleIcon}
            color="bg-emerald-500"
            change="+5%"
            changeType="increase"
          />
          <StatCard
            title="New Users (Month)"
            value={stats.newUsersThisMonth}
            icon={CalendarDaysIcon}
            color="bg-indigo-500"
            change="+18%"
            changeType="increase"
          />
          <StatCard
            title="Avg Project Value"
            value={stats.averageProjectValue}
            icon={CurrencyDollarIcon}
            color="bg-cyan-500"
            change="+3%"
            changeType="increase"
            prefix="$"
          />
          <StatCard
            title="Pending Projects"
            value={stats.pendingProjects}
            icon={ExclamationTriangleIcon}
            color="bg-red-500"
            change="-5%"
            changeType="decrease"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'users', label: 'Users', icon: UsersIcon },
                { id: 'projects', label: 'Projects', icon: BriefcaseIcon },
                { id: 'settings', label: 'Settings', icon: CogIcon },
                { id: 'activity', label: 'Activity Log', icon: BellIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Platform Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                    <p className="text-sm text-gray-600">
                      Monitor platform activity, user registrations, and project submissions.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                    <p className="text-sm text-gray-600">
                      All systems operational. No issues detected.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => exportData('users')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                      >
                        Bulk Actions ({selectedUsers.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {showBulkActions && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Bulk Actions</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkUserAction('activate')}
                        className="px-3 py-1 text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        Activate Selected
                      </button>
                      <button
                        onClick={() => handleBulkUserAction('deactivate')}
                        className="px-3 py-1 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        Deactivate Selected
                      </button>
                      <button
                        onClick={() => handleBulkUserAction('delete')}
                        className="px-3 py-1 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(filteredUsers.map(u => u._id));
                              } else {
                                setSelectedUsers([]);
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className={selectedUsers.includes(user._id) ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleUserSelection(user._id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.userType === 'client' 
                                ? 'bg-blue-100 text-blue-800'
                                : user.userType === 'freelancer'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isActive)}
                              className={`text-sm font-medium ${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Showing {filteredUsers.length} of {users.length} users</span>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Project Management</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => exportData('projects')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    {selectedProjects.length > 0 && (
                      <button
                        onClick={() => setShowProjectBulkActions(!showProjectBulkActions)}
                        className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                      >
                        Bulk Actions ({selectedProjects.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                    <select
                      value={projectStatusFilter}
                      onChange={(e) => setProjectStatusFilter(e.target.value as 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'archived')}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {showProjectBulkActions && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Bulk Actions</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkProjectAction('feature')}
                        className="px-3 py-1 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Feature Selected
                      </button>
                      <button
                        onClick={() => handleBulkProjectAction('archive')}
                        className="px-3 py-1 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        Archive Selected
                      </button>
                      <button
                        onClick={() => handleBulkProjectAction('delete')}
                        className="px-3 py-1 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjects(filteredProjects.map(p => p._id));
                              } else {
                                setSelectedProjects([]);
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProjects.map((project) => (
                        <tr key={project._id} className={selectedProjects.includes(project._id) ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(project._id)}
                              onChange={() => handleProjectSelection(project._id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{project.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {project.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{project.client.name}</div>
                              <div className="text-sm text-gray-500">{project.client.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.budget.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.status === 'open' 
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : project.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : project.status === 'archived'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {project.status === 'in_progress' ? 'In Progress' : project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteProject(project._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Analytics & Reports</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={analyticsTimeRange}
                      onChange={(e) => setAnalyticsTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">↗ Platform lifetime revenue</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">New Users This Month</h4>
                    <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                    <p className="text-sm text-green-600">↗ Current month registrations</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Project Success Rate</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                    </p>
                    <p className="text-sm text-green-600">↗ Completed vs Total projects</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Average Project Value</h4>
                    <p className="text-2xl font-bold text-gray-900">${stats.averageProjectValue.toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Mean project budget</p>
                  </div>
                </div>

                {/* Project Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Project Status Overview</h4>
                    {analyticsData?.projectStats ? (
                      <div className="space-y-3">
                        {analyticsData.projectStats.map((stat, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                stat._id === 'completed' ? 'bg-green-500' :
                                stat._id === 'open' ? 'bg-blue-500' :
                                stat._id === 'in_progress' ? 'bg-yellow-500' :
                                stat._id === 'cancelled' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {stat._id.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{stat.count}</p>
                              <p className="text-xs text-gray-500">${stat.totalBudget.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Loading project statistics...</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">User Registration Trends</h4>
                    {analyticsData?.userStats ? (
                      <div className="space-y-3">
                        {analyticsData.userStats.slice(0, 6).map((stat, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                stat._id.userType === 'client' ? 'bg-blue-500' :
                                stat._id.userType === 'freelancer' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {stat._id.userType}s - {stat._id.month}/{stat._id.year}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{stat.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Loading user statistics...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Health Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total users
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
                      <p className="text-sm text-gray-600">Completed Projects</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% success rate
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{stats.pendingProjects}</p>
                      <p className="text-sm text-gray-600">Pending Projects</p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
                  <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>All Activities</option>
                      <option>User Actions</option>
                      <option>System Events</option>
                      <option>Admin Actions</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {activityLogs.map((log, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                            log.type === 'user' ? 'bg-blue-500' :
                            log.type === 'admin' ? 'bg-purple-500' :
                            log.type === 'system' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{log.action}</p>
                              <span className="text-xs text-gray-500">{log.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600">{log.details}</p>
                            <p className="text-xs text-gray-500 mt-1">by {log.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Platform Settings */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Platform Fee (%)</label>
                        <input
                          type="number"
                          value={platformSettings.feePercentage}
                          onChange={(e) => setPlatformSettings({
                            ...platformSettings,
                            feePercentage: parseFloat(e.target.value)
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Project Budget</label>
                        <input
                          type="number"
                          value={platformSettings.minProjectBudget}
                          onChange={(e) => setPlatformSettings({
                            ...platformSettings,
                            minProjectBudget: parseFloat(e.target.value)
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.autoApproveProjects}
                          onChange={(e) => setPlatformSettings({
                            ...platformSettings,
                            autoApproveProjects: e.target.checked
                          })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Auto-approve new projects</label>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.requireEmailVerification}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            requireEmailVerification: e.target.checked
                          })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Require email verification</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.enableTwoFactor}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            enableTwoFactor: e.target.checked
                          })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable two-factor authentication</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(e.target.value)
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveSettings}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
