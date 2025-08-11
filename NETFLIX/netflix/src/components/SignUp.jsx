import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    setError('Vui lòng điền đầy đủ thông tin!');
    return;
  }

  try {
    const response = await axios.post('http://localhost:8080/users/register', {
      userName: email.split('@')[0], 
      email,
      password
    });
    alert('Đăng ký thành công!');
    navigate('/signin');
  } catch (err) {
    setError(err.response?.data?.message || 'Đăng ký thất bại.');
  }
};

  return (
      <form onSubmit={handleSignUp} className="auth-box">        
        <h1>Đăng ký</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
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
        <button type="submit">Đăng ký</button>
        
        <div className="signup-text">
          Bạn đã có tài khoản? <Link to="/signin">Đăng nhập ngay</Link>.
        </div>
        <div className="recaptcha-text">
          Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là robot. <a href="#">Tìm hiểu thêm.</a>
        </div>
      </form>
  );
}

export default SignUp;