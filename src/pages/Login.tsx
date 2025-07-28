import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  BriefcaseIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    if (user) {
      const redirectPath = user.userType === 'client' 
        ? '/client/dashboard' 
        : '/freelancer/dashboard';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-150"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-300"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center px-12">
        <motion.div 
          className="max-w-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="relative">
              <BriefcaseIcon className="h-16 w-16 text-primary-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text">FreelanceFlow</h1>
              <p className="text-neutral-600 font-medium">Professional. Reliable. Secure.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
              Welcome back to the future of freelancing
            </h2>
            <p className="text-lg text-neutral-600 leading-relaxed mb-8">
              Join millions of professionals who trust FreelanceFlow to connect, 
              collaborate, and create amazing projects together.
            </p>

            <div className="space-y-4">
              {[
                'Connect with top-rated professionals',
                'Secure payments and milestone tracking',
                'Advanced project management tools',
                '24/7 customer support'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-3 w-3 text-primary-600" />
                  </div>
                  <span className="text-neutral-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="card-premium p-8 lg:p-10">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-neutral-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Sign up for free
                </Link>
              </p>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className={`input-premium pl-12 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    className={`input-premium pl-12 pr-12 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon className="ml-3 h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* Demo Login Buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-neutral-600 font-medium">Quick Demo Access</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setValue('email', 'client@demo.com');
                      setValue('password', 'password123');
                      handleSubmit(onSubmit)();
                    }}
                    className="btn-secondary text-sm py-2.5 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    Demo Client
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => {
                      setValue('email', 'freelancer@demo.com');
                      setValue('password', 'password123');
                      handleSubmit(onSubmit)();
                    }}
                    className="btn-secondary text-sm py-2.5 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    Demo Freelancer
                  </motion.button>
                </div>
              </div>
            </motion.form>

            <motion.div 
              className="mt-8 pt-6 border-t border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-center text-sm text-neutral-600">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Mobile Branding */}
          <motion.div 
            className="lg:hidden mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BriefcaseIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-display font-bold gradient-text">FreelanceFlow</span>
            </div>
            <p className="text-sm text-neutral-600">
              Trusted by 10M+ professionals worldwide
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
