// Authentication utility functions
export const isAuthenticated = () => {
  const apiKey = localStorage.getItem('apiKey');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  
  return !!(apiKey && userRole && userName);
};

export const getUserData = () => {
  return {
    apiKey: localStorage.getItem('apiKey'),
    userRole: localStorage.getItem('userRole'),
    userName: localStorage.getItem('userName'),
    userId: localStorage.getItem('userId')
  };
};

export const logout = () => {
  // Clear all auth data
  localStorage.removeItem('apiKey');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberedEmail');
  
  // Redirect to home page
  window.location.href = '/';
};

export const setAuthData = (data) => {
  localStorage.setItem('apiKey', data.apiKey);
  localStorage.setItem('userRole', data.role);
  localStorage.setItem('userName', data.userName);
  localStorage.setItem('userId', data.id);
};

// Check if user is admin
export const isAdmin = () => {
  const userRole = localStorage.getItem('userRole');
  return userRole === 'admin';
};

// Get auth headers for API calls
export const getAuthHeaders = () => {
  const apiKey = localStorage.getItem('apiKey');
  return apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
};
