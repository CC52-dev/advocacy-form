'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if there's a launch_token in the URL
        const launchToken = searchParams.get('launch_token');
        
        if (launchToken) {
          // Save to localStorage and clean the URL
          localStorage.setItem('app_token', launchToken);
          // Remove the token from URL for security
          window.history.replaceState({}, document.title, '/');
        }

        // Get token from localStorage
        const token = localStorage.getItem('app_token');
        
        if (!token) {
          setError('No authentication token found. Please launch from the main application.');
          setLoading(false);
          return;
        }

        // Verify token with the API (using the application's API key)
        const API_KEY = 'app_b77b11ea2059efbfdfcf6f8741eafb75bdde213de7639ac3b3506b4e164f5dc9';
        
        const response = await fetch('http://localhost:3001/api/applications/verify-launch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token,
            apiKey: API_KEY 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify token');
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to verify authentication. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchUserData();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('app_token');
    setUserData(null);
    setError('Logged out successfully. Please close this window or launch again from the main application.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-center text-gray-800">Authentication Error</h2>
          <p className="mt-2 text-center text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-xl p-8 border-b-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{userData.application?.name || 'OAuth Test Application'}</h1>
              <p className="mt-2 text-gray-600">Session verification successful ✓</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8">
          {/* Session Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                label="Session Expires" 
                value={new Date(userData.session.expiresAt).toLocaleString()} 
                icon="⏰"
              />
              <InfoCard 
                label="Time Remaining" 
                value={getTimeRemaining(userData.session.expiresAt)} 
                icon="⏳"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                label="Name" 
                value={`${userData.user.firstname || ''} ${userData.user.lastname || ''}`.trim() || 'Not provided'} 
                icon="👤" 
              />
              <InfoCard label="Email" value={userData.user.email} icon="📧" />
            </div>
          </div>

          {/* Interests */}
          {userData.user.interests && userData.user.interests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {userData.user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium shadow-md"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roles/Permissions */}
          {userData.permissions && userData.permissions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Application Permissions
              </h2>
              <div className="space-y-4">
                {userData.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-indigo-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{permission.code || 'Permission'}</h3>
                        {permission.title && (
                          <span className="inline-block mt-1 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                            {permission.title}
                          </span>
                        )}
                      </div>
                      <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            This is a test application demonstrating OAuth integration.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Token stored in localStorage • Session managed by main application
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function getTimeRemaining(expiresAt) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
