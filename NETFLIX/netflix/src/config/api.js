// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://netflix-backend-gyi6.onrender.com';

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 Environment:', import.meta.env.MODE);
console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL);

export default API_BASE_URL;
