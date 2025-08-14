import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from './Notification';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [notification, setNotification] = useState(null);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'Yếu';
    if (password.length < 8) return 'Trung bình';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)) {
      return 'Mạnh';
    }
    return 'Trung bình';
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Tên người dùng là bắt buộc';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Tên người dùng phải có ít nhất 3 ký tự';
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
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

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8080/users/register', {
        userName: formData.userName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      if (response.data.success) {
        setNotification({
          message: '🎉 Đăng ký thành công! Vui lòng đăng nhập.',
          type: 'success'
        });
        
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
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
      
      <form onSubmit={handleSignUp} className="auth-box">        
        <h1>Đăng ký</h1>
        
        {errors.submit && <p className="error-message">{errors.submit}</p>}
        
        {/* Username Field */}
        <div className="input-group">
          <input
            type="text"
            name="userName"
            placeholder="Tên người dùng"
            value={formData.userName}
            onChange={handleInputChange}
            className={errors.userName ? 'error' : ''}
            required
          />
          {errors.userName && <span className="error-text">{errors.userName}</span>}
        </div>

        {/* Email Field */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
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
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            required
          />
          {formData.password && (
            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Độ mạnh mật khẩu: {passwordStrength}
            </div>
          )}
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        {/* Confirm Password Field */}
        <div className="input-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            required
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        
        <div className="signup-text">
          Bạn đã có tài khoản? <Link to="/signin">Đăng nhập ngay</Link>.
        </div>
        
        <div className="recaptcha-text">
          Bằng cách đăng ký, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi.
        </div>
      </form>
    </div>
  );
}

export default SignUp;