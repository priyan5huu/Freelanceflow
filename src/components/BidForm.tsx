import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BidFormProps {
  projectId: string;
  onClose: () => void;
  onBidSubmitted: () => void;
}

interface BidFormData {
  amount: number;
  message: string;
  deliveryTime: number;
}

const schema = yup.object({
  amount: yup
    .number()
    .required('Bid amount is required')
    .min(1, 'Bid amount must be at least $1'),
  message: yup
    .string()
    .required('Proposal message is required')
    .min(50, 'Message must be at least 50 characters'),
  deliveryTime: yup
    .number()
    .required('Delivery time is required')
    .min(1, 'Delivery time must be at least 1 day'),
});

const BidForm: React.FC<BidFormProps> = ({ projectId, onClose, onBidSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: BidFormData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/projects/${projectId}/bids`, data);
      toast.success('Bid submitted successfully!');
      onBidSubmitted();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Failed to submit bid'
        : 'Failed to submit bid';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Submit Your Proposal</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Bid Amount ($)
              </label>
              <input
                type="number"
                id="amount"
                {...register('amount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your bid amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (days)
              </label>
              <input
                type="number"
                id="deliveryTime"
                {...register('deliveryTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Days to complete"
              />
              {errors.deliveryTime && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Message
            </label>
            <textarea
              id="message"
              rows={6}
              {...register('message')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your approach, experience, and why you're the best fit for this project..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidForm;