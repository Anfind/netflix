import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const apiKey = localStorage.getItem('apiKey');
      
      console.log('ProtectedRoute checking auth, apiKey:', apiKey); // Debug log
      
      if (!apiKey) {
        console.log('No apiKey found, redirecting to signin'); // Debug log
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying token with backend...'); // Debug log
        // Verify token with backend
        const response = await axios.get('http://localhost:8080/users/verify', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        console.log('Token verification response:', response.data); // Debug log

        if (response.data.success) {
          console.log('Token verified successfully'); // Debug log
          setIsAuthenticated(true);
          setUserRole(response.data.data.role);
          
          // Update localStorage with fresh data
          localStorage.setItem('userRole', response.data.data.role);
          localStorage.setItem('userName', response.data.data.userName);
          localStorage.setItem('userId', response.data.data.id);
        } else {
          console.log('Token verification failed'); // Debug log
          // Invalid token - clear localStorage
          localStorage.removeItem('apiKey');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear invalid auth data
        localStorage.removeItem('apiKey');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/movies" replace />;
  }

  return children;
};

export default ProtectedRoute;
