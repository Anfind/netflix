import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8080/users/login', {
      email,
      password
    });

    const { data } = response.data;
    localStorage.setItem('apiKey', data.apiKey);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('userName', data.userName);
    
    alert('Đăng nhập thành công!');
    
    // Redirect based on role
    if (data.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/movies');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.');
  }
};

  return (
      <form onSubmit={handleSignIn} className="auth-box">        
        <h1>Đăng nhập</h1>
        {error && <p className="error-message">{error}</p>} 
        <input
          type="email"
          placeholder="Email hoặc số điện thoại di động"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>

        <div className="help-options">
          <label>
            <input type="checkbox" defaultChecked /> Ghi nhớ tôi
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
  );
}

export default SignIn;