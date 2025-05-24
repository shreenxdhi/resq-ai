import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ResQ.AI
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              © {new Date().getFullYear()} ResQ.AI. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex space-x-6">
              <Link
                to="/about"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-whit"
              >
                {t('about', 'About')}
              </Link>
              <Link
                to="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-whit"
              >
                {t('privacyPolicy', 'Privacy Policy')}
              </Link>
              <Link
                to="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-whit"
              >
                {t('termsOfService', 'Terms of Service')}
              </Link>
              <Link
                to="/contact"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-whit"
              >
                {t('contact', 'Contact')}
              </Link>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('version', 'Version')} {process.env.REACT_APP_VERSION || '1.0.0'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 