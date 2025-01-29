import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full relative bottom-0 bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About Us</h3>
            <p className="text-gray-600 dark:text-gray-300">Satsankalpa Foundation is dedicated to making a positive impact in our community through various initiatives and programs.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Home</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Sign Up</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Log In</Link></li>
              <li><Link href="https://satsankalpa.org" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Satsankalpa.org</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">Email: info@satsankalpa.org</li>
              <li className="text-gray-600 dark:text-gray-300">Phone: +1 (555) 123-4567</li>
              <li className="text-gray-600 dark:text-gray-300">Address: 123 Main St, City, State</li>
            </ul>
          </div>
          
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} Satsankalpa Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;