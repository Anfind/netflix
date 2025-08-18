import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthData } from '../utils/auth';
import Notification from './Notification';
import API_BASE_URL from '../config/api';

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      if (response.data.success) {
        const { data } = response.data;
        
        console.log('Login response data:', data); // Debug log
        
        // Save auth data using utility function
        setAuthData(data);
        
        console.log('Auth data saved, navigating...'); // Debug log
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Show success message
        setNotification({
          message: `🎉 Chào mừng ${data.userName}! Đăng nhập thành công.`,
          type: 'success'
        });
        
        // Redirect immediately
        if (data.role === 'admin') {
          console.log('Navigating to admin...'); // Debug log
          navigate('/admin', { replace: true });
        } else {
          console.log('Navigating to movies...'); // Debug log
          navigate('/movies', { replace: true });
        }
      } else {
        console.log('Login failed:', response.data); // Debug log
        setErrors({ submit: 'Đăng nhập thất bại' });
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      console.error('Response data:', err.response?.data); // Debug log
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <form onSubmit={handleSignIn} className="auth-box">        
        <h1>Đăng nhập</h1>
        
        {errors.submit && <p className="error-message">{errors.submit}</p>}
        
        {/* Email Field */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email hoặc số điện thoại di động"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Password Field */}
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="help-options">
          <label>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            /> 
            Ghi nhớ tôi
          </label>
          <Link to="/forgot-password">Bạn cần trợ giúp?</Link> 
        </div>

        <div className="signup-text">
          Bạn mới tham gia Netflix? <Link to="/signup">Đăng ký ngay</Link>.
        </div>
        
        <div className="recaptcha-text">
          Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là robot. <a href="#">Tìm hiểu thêm.</a>
        </div>
      </form>
    </div>
  );
}

export default SignIn;