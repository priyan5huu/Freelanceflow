import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  XMarkIcon, 
  PlusIcon, 
  XCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ProjectFormProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
}

const schema = yup.object({
  title: yup
    .string()
    .required('Project title is required')
    .min(10, 'Title must be at least 10 characters'),
  description: yup
    .string()
    .required('Project description is required')
    .min(100, 'Description must be at least 100 characters'),
  budget: yup
    .number()
    .required('Budget is required')
    .min(50, 'Budget must be at least $50'),
  deadline: yup
    .string()
    .required('Deadline is required'),
});

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onProjectCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
  });

  const watchedFields = watch();

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill requirement');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/projects', {
        ...data,
        skills,
      });
      toast.success('Project posted successfully!');
      onProjectCreated();
    } catch (error) {
      toast.error('Failed to post project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Project Details', icon: DocumentTextIcon },
    { id: 2, title: 'Budget & Timeline', icon: CurrencyDollarIcon },
    { id: 3, title: 'Skills Required', icon: TagIcon },
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return watchedFields.title?.length >= 10 && watchedFields.description?.length >= 100;
      case 2:
        return watchedFields.budget >= 50 && watchedFields.deadline;
      case 3:
        return skills.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Post a New Project
          </h2>
          <p className="text-neutral-600">
            Tell us about your project and attract the right freelancers
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors duration-200"
        >
          <XMarkIcon className="h-6 w-6 text-neutral-400" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="hidden sm:block">
                  <div className={`text-sm font-semibold ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-neutral-400'
                  }`}>
                    Step {step.id}
                  </div>
                  <div className={`text-xs ${
                    currentStep >= step.id ? 'text-neutral-900' : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
              {index !== steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Project Title
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('title')}
                    type="text"
                    id="title"
                    placeholder="e.g., Build a responsive e-commerce website"
                    className={`input-premium pl-12 ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  {watchedFields.title?.length || 0}/10 characters minimum
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Project Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={6}
                  placeholder="Describe your project in detail. Include specific requirements, features, and expectations..."
                  className={`input-premium resize-none ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  {watchedFields.description?.length || 0}/100 characters minimum
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Budget & Timeline */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Project Budget (USD)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('budget', { valueAsNumber: true })}
                    type="number"
                    id="budget"
                    min="50"
                    step="50"
                    placeholder="5000"
                    className={`input-premium pl-12 ${errors.budget ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.budget && (
                  <p className="mt-2 text-sm text-red-600">{errors.budget.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  Set a competitive budget to attract quality freelancers
                </p>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Project Deadline
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('deadline')}
                    type="date"
                    id="deadline"
                    min={new Date().toISOString().split('T')[0]}
                    className={`input-premium pl-12 ${errors.deadline ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.deadline && (
                  <p className="mt-2 text-sm text-red-600">{errors.deadline.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  Allow reasonable time for quality work
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Skills Required */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="skills" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Required Skills
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="e.g., React, Node.js, UI/UX Design"
                      className="input-premium pl-12"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-secondary px-6"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Add skills one by one and press Enter or click the + button
                </p>
              </div>

              {skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                    Added Skills ({skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {skills.map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-primary-500 hover:text-primary-700 transition-colors duration-200"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {skills.length === 0 && (
                <div className="text-center py-8">
                  <SparklesIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No skills added yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-neutral-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-ghost"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isStepValid(3)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Posting Project...
                  </div>
                ) : (
                  'Post Project'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;