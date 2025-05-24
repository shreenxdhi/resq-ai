import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import copy from 'copy-to-clipboard';
import { disasterTypes } from '../utils/mockData';
import axios from 'axios';

const PlanModal = ({ onClose, initialLocation }) => {
  const [location, setLocation] = useState({
    country: initialLocation?.country || '',
    city: initialLocation?.city || ''
  });
  const [disasterType, setDisasterType] = useState('');
  const [tips, setTips] = useState([]);
  const [visibleTips, setVisibleTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [copied, setCopied] = useState(false);

  // When tips are loaded, display them one by one with a typewriter effect
  useEffect(() => {
    if (tips.length > 0 && generated) {
      const timer = setTimeout(() => {
        if (visibleTips.length < tips.length) {
          setVisibleTips(tips.slice(0, visibleTips.length + 1));
        }
      }, 300); // Show a new tip every 300ms
      
      return () => clearTimeout(timer);
    }
  }, [tips, visibleTips, generated]);

  // Calculate estimated execution time based on disaster type
  useEffect(() => {
    if (disasterType && generated) {
      // Different disasters need different response times
      const baseTime = 30; // 30 minutes base time
      let multiplier = 1;
      
      switch (disasterType.toLowerCase()) {
        case 'earthquake':
          multiplier = 1.5;
          break;
        case 'flood':
          multiplier = 2.0;
          break;
        case 'hurricane':
        case 'tornado':
          multiplier = 1.8;
          break;
        case 'wildfire':
          multiplier = 2.5;
          break;
        default:
          multiplier = 1.2;
      }
      
      // Calculate time in minutes
      const time = Math.round(baseTime * multiplier);
      setEstimatedTime(time);
    }
  }, [disasterType, generated]);

  const handleGenerateTips = async (e) => {
    e.preventDefault();
    
    if (!location.country || !location.city || !disasterType) {
      return;
    }
    
    setLoading(true);
    setError('');
    setVisibleTips([]);
    
    try {
      // Call the API to generate tips
      const response = await axios.post('http://localhost:5000/api/generate-tips', {
        disaster: disasterType,
        city: location.city
      });
      
      // Update the tips state with the response
      setTips(response.data.tips);
      setGenerated(true);
    } catch (err) {
      console.error('Error generating tips:', err);
      setError('Failed to generate tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!location.country || !location.city || !disasterType || !tips.length) {
      return;
    }

    try {
      // Get user ID from localStorage (mock authentication)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.email || 'anonymous';

      // Call the API to save the plan
      await axios.post('http://localhost:5000/api/plans', {
        userId,
        country: location.country,
        city: location.city,
        disaster: disasterType,
        tips
      });

      // Show success message
      alert('Plan saved successfully!');
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan. Please try again.');
    }
  };

  const handleCopyTips = () => {
    const tipsText = tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n');
    copy(tipsText);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <motion.h2 
                className="text-xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Create Emergency Response Plan
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>
            
            <motion.form 
              onSubmit={handleGenerateTips}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label htmlFor="disasterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disaster Type
                  </label>
                  <select
                    id="disasterType"
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select disaster type</option>
                    {disasterTypes.map(type => (
                      <option key={type.id} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || !location.country || !location.city || !disasterType}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                    : 'Generate Tips'
                  }
                </motion.button>
              </div>
            </motion.form>
            
            {error && (
              <motion.div 
                className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            {/* Loading skeleton */}
            {loading && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <Skeleton height={30} width={300} className="mb-4" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={60} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Results section */}
            {generated && (
              <motion.div 
                className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Emergency Response Tips for {location.city}, {location.country}
                  </h3>
                  <motion.button
                    onClick={handleCopyTips}
                    className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!tips.length}
                  >
                    {copied ? 'Copied!' : 'Copy All Tips'}
                  </motion.button>
                </div>
                
                {estimatedTime > 0 && (
                  <motion.div 
                    className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Estimated execution time: <strong>{estimatedTime} minutes</strong></span>
                    </div>
                  </motion.div>
                )}
                
                {visibleTips.length > 0 ? (
                  <ul className="space-y-3">
                    {visibleTips.map((tip, index) => (
                      <motion.li 
                        key={index} 
                        className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400 font-semibold mr-2">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {tip}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No tips available for this scenario.
                  </p>
                )}
                
                <div className="mt-6 flex space-x-4">
                  <motion.button
                    type="button"
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    onClick={handleSavePlan}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Save Plan
                  </motion.button>
                  <motion.button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    onClick={() => {
                      // Mock download functionality
                      alert('Plan downloaded as PDF');
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Download as PDF
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlanModal; 