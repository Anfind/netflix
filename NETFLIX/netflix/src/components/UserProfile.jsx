import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'favorites');
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const apiKey = localStorage.getItem('apiKey');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!apiKey) {
      alert('Vui lòng đăng nhập để xem profile!');
      navigate('/signin');
      return;
    }
    
    // Show welcome message nếu user vừa navigate từ movies
    if (location.state?.activeTab === 'favorites') {
      const welcomeNotification = document.createElement('div');
      welcomeNotification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, rgba(34,139,34,0.95) 0%, rgba(0,100,0,0.95) 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 8px 25px rgba(34,139,34,0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        animation: slideInRight 0.4s ease;
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      welcomeNotification.textContent = '❤️ Chào mừng đến trang yêu thích!';
      document.body.appendChild(welcomeNotification);
      
      setTimeout(() => {
        welcomeNotification.style.opacity = '0';
        welcomeNotification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(welcomeNotification)) {
            document.body.removeChild(welcomeNotification);
          }
        }, 300);
      }, 3000);
    }
    
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect để tắt/bật scroll khi modal mở/đóng
  useEffect(() => {
    if (selectedMovie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMovie]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user data with token:', apiKey);
      
      // Fetch user profile
      const profileRes = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      console.log('Profile data:', profileRes.data);
      setProfile(profileRes.data.data);

      // Fetch favorites
      const favoritesRes = await axios.get(`${API_BASE_URL}/users/favorites`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      console.log('Favorites data:', favoritesRes.data);
      setFavorites(favoritesRes.data.data || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/signin');
      } else {
        alert('Lỗi tải dữ liệu người dùng: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (movieId) => {
    if (!confirm('Bạn có chắc muốn xóa khỏi danh sách yêu thích?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/favorites/${movieId}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      setFavorites(favorites.filter(fav => fav._id !== movieId));
      setSelectedMovie(null); // Đóng modal sau khi xóa
      alert('Đã xóa khỏi danh sách yêu thích!');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Lỗi xóa khỏi danh sách yêu thích');
    }
  };

  const handlePlayMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const goToMovies = () => {
    navigate('/movies');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(229,9,20,0.3)',
            borderTop: '4px solid #e50914',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Đang tải profile...</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)',
        padding: '15px 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        backdropFilter: 'blur(15px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '70px'
        }}>
          <h1 
            onClick={goToMovies} 
            style={{
              cursor: 'pointer',
              fontSize: '1.8rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #e50914 0%, #ff6b6b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}
          >
            🎬 Netflix Clone
          </h1>
          
          <nav style={{
            display: 'flex',
            gap: '20px'
          }}>
            <button 
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => setActiveTab('favorites')}
              style={{
                background: activeTab === 'favorites' 
                  ? 'linear-gradient(135deg, #e50914 0%, #c40812 100%)'
                  : 'rgba(255,255,255,0.1)',
                border: activeTab === 'favorites' 
                  ? '2px solid #e50914'
                  : '2px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              ❤️ Yêu thích ({favorites.length})
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' 
                  ? 'linear-gradient(135deg, #e50914 0%, #c40812 100%)'
                  : 'rgba(255,255,255,0.1)',
                border: activeTab === 'profile' 
                  ? '2px solid #e50914'
                  : '2px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              👤 Profile
            </button>
          </nav>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <span style={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1rem'
            }}>
              Xin chào, <strong style={{color: '#e50914'}}>{userName}</strong>!
            </span>
            <button 
              onClick={goToMovies}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              ← Quay lại
            </button>
            <button 
              onClick={handleSignOut}
              style={{
                background: 'linear-gradient(135deg, rgba(229,9,20,0.8) 0%, rgba(190,8,17,0.8) 100%)',
                border: '2px solid rgba(229,9,20,0.8)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ paddingTop: '100px' }}>
        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
        <div className="favorites-content">
          <div className="content-header">
            <h2>❤️ Phim yêu thích của bạn</h2>
            <p>Danh sách {favorites.length} bộ phim bạn đã thêm vào yêu thích</p>
          </div>

          {favorites.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              margin: '40px auto',
              maxWidth: '600px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                fontSize: '5rem',
                marginBottom: '30px',
                opacity: 0.7
              }}>💔</div>
              <h3 style={{ 
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'white'
              }}>
                Chưa có phim yêu thích nào
              </h3>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '40px',
                lineHeight: '1.6'
              }}>
                Hãy khám phá và thêm những bộ phim bạn yêu thích vào danh sách này!<br/>
                Tạo bộ sưu tập phim riêng của bạn ngay hôm nay.
              </p>
              <button 
                onClick={goToMovies}
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(135deg, #e50914 0%, #c40812 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(229,9,20,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05) translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(229,9,20,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(229,9,20,0.4)';
                }}
              >
                🎬 Khám phá phim ngay
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {favorites.map((movie, index) => (
                <div key={movie._id || index} className="movie-card">
                  <div className="movie-poster" onClick={() => handlePlayMovie(movie)}>
                    <img src={movie.poster_path} alt={movie.title} />
                    <div className="movie-overlay">
                      <button className="play-btn">▶️ Xem</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="rating">⭐ {movie.vote_average}</span>
                      <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    <div className="movie-genres">
                      {movie.genres?.slice(0, 2).map((genre, index) => (
                        <span key={index} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                    <p className="added-date">
                      Thêm vào: {new Date(movie.addedAt).toLocaleDateString('vi-VN')}
                    </p>
                    <button 
                      onClick={() => handleRemoveFromFavorites(movie._id)}
                      className="remove-btn"
                    >
                      🗑️ Xóa khỏi yêu thích
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="content-header">
            <h2>👤 Thông tin cá nhân</h2>
            <p>Quản lý thông tin tài khoản của bạn</p>
          </div>

          <div className="profile-info" style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '300px 1fr' : '1fr',
            gap: '40px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '40px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div className="avatar-section" style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div className="avatar" style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e50914 0%, #ff6b6b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 10px 30px rgba(229,9,20,0.4)',
                border: '4px solid rgba(255,255,255,0.2)'
              }}>
                {profile.profile?.avatar ? (
                  <img src={profile.profile.avatar} alt="Avatar" style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} />
                ) : (
                  <div style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {userName?.charAt(0).toUpperCase() || '👤'}
                  </div>
                )}
              </div>
              <button 
                className="change-avatar-btn"
                onClick={() => alert('Chức năng đổi ảnh đại diện đang được phát triển!')}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(229,9,20,0.8)';
                  e.target.style.borderColor = '#e50914';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                📷 Đổi ảnh đại diện
              </button>
            </div>

            <div className="info-section">
              <div className="info-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '25px',
                marginBottom: '40px'
              }}>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Tên người dùng</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>{userName || 'N/A'}</p>
                </div>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Email</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>{profile.email || 'N/A'}</p>
                </div>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Vai trò</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: profile.role === 'admin' ? '#FFD700' : '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Ngày tham gia</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : 'N/A'}</p>
                </div>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Số phim yêu thích</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#e50914',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>❤️ {favorites.length} phim</p>
                </div>
                <div className="info-item" style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Số phim yêu thích</label>
                  <p style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>❤️ {favorites.length} phim</p>
                </div>
              </div>

              <div className="account-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={() => alert('Chức năng chỉnh sửa thông tin đang được phát triển!')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(76,175,80,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(76,175,80,0.4)';
                  }}
                >
                  ✏️ Chỉnh sửa thông tin
                </button>
                <button 
                  className="change-password-btn"
                  onClick={() => alert('Chức năng đổi mật khẩu đang được phát triển!')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255,152,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255,152,0,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255,152,0,0.4)';
                  }}
                >
                  🔒 Đổi mật khẩu
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
                      alert('Chức năng xóa tài khoản đang được phát triển!');
                    }
                  }}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(244,67,54,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '10px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(244,67,54,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(244,67,54,0.4)';
                  }}
                >
                  🗑️ Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Movie Modal */}
      {selectedMovie && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 2147483647,
            display: 'block',
            overflow: 'auto',
            padding: 0,
            margin: 0,
            boxSizing: 'border-box'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          {/* Close Button */}
          <button
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 2147483648,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(229,9,20,0.9)';
              e.target.style.borderColor = 'rgba(229,9,20,0.9)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
            }}
            onClick={handleCloseModal}
          >
            ×
          </button>

          {/* Modal Content */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)',
            minHeight: '100vh',
            animation: 'fadeIn 0.4s ease'
          }}>
            {/* Hero Section */}
            <div style={{
              width: '100%',
              height: '80vh',
              background: `
                linear-gradient(
                  to bottom,
                  rgba(0,0,0,0) 0%,
                  rgba(0,0,0,0) 40%,
                  rgba(0,0,0,0.6) 70%,
                  rgba(0,0,0,0.9) 100%
                ),
                linear-gradient(
                  to right,
                  rgba(0,0,0,0.8) 0%,
                  rgba(0,0,0,0.3) 50%,
                  rgba(0,0,0,0) 100%
                ),
                url(${selectedMovie.backdrop_path || selectedMovie.poster_path})
              `,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '80px 60px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                color: 'white', 
                zIndex: 2, 
                maxWidth: window.innerWidth > 768 ? '55%' : '90%'
              }}>
                <h1 style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: '700',
                  marginBottom: '25px',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
                  lineHeight: '1.1',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {selectedMovie.title}
                </h1>
                
                {/* Movie Info Pills */}
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  marginBottom: '25px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, rgba(229,9,20,0.9) 0%, rgba(190,8,17,0.9) 100%)',
                    padding: '8px 18px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 15px rgba(229,9,20,0.3)'
                  }}>
                    ⭐ {selectedMovie.vote_average}/10
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '8px 18px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    📅 {selectedMovie.release_date?.split('-')[0]}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '8px 18px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    ❤️ Yêu thích
                  </span>
                </div>
                
                <p style={{ 
                  fontSize: '1.3rem',
                  lineHeight: '1.7',
                  marginBottom: '35px',
                  maxWidth: '90%',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  color: 'rgba(255,255,255,0.95)'
                }}>
                  {selectedMovie.overview?.length > 200 
                    ? selectedMovie.overview.substring(0, 200) + '...'
                    : selectedMovie.overview
                  }
                </p>
                
                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    style={{
                      padding: '18px 35px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minWidth: '140px',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      opacity: selectedMovie.video_url ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05) translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1) translateY(0px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                    }}
                    disabled={!selectedMovie.video_url}
                  >
                    ▶ Phát ngay
                  </button>
                  
                  <button
                    style={{
                      padding: '18px 35px',
                      background: 'rgba(229,9,20,0.8)',
                      color: 'white',
                      border: '2px solid rgba(229,9,20,0.8)',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minWidth: '140px',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(229,9,20,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(190,8,17,0.9)';
                      e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(229,9,20,0.8)';
                      e.target.style.transform = 'scale(1) translateY(0px)';
                    }}
                    onClick={() => handleRemoveFromFavorites(selectedMovie._id)}
                  >
                    🗑️ Xóa yêu thích
                  </button>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div style={{
              padding: '60px',
              background: `
                linear-gradient(180deg, 
                  rgba(0,0,0,0.9) 0%,
                  rgba(10,10,10,0.95) 50%,
                  rgba(0,0,0,1) 100%
                )
              `,
              color: 'white',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? '2fr 1fr' : '1fr',
                gap: '50px',
                maxWidth: '1400px',
                margin: '0 auto'
              }}>
                {/* Left Column */}
                <div>
                  <h2 style={{ 
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '25px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Về bộ phim này
                  </h2>
                  
                  <p style={{ 
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '30px'
                  }}>
                    {selectedMovie.overview}
                  </p>
                  
                  {/* Genre Tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '25px'
                  }}>
                    {selectedMovie.genres?.slice(0, 4).map((genre, index) => (
                      <span key={index} style={{
                        background: 'linear-gradient(135deg, rgba(229,9,20,0.2) 0%, rgba(190,8,17,0.2) 100%)',
                        border: '1px solid rgba(229,9,20,0.4)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Right Column - Metadata */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '15px',
                  padding: '30px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ 
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    marginBottom: '25px',
                    color: '#ffffff',
                    borderBottom: '2px solid rgba(229,9,20,0.5)',
                    paddingBottom: '10px'
                  }}>
                    Thông tin chi tiết
                  </h3>
                  
                  {[
                    { label: '🎬 Thể loại', value: selectedMovie.genres?.join(', ') || 'Chưa phân loại' },
                    { label: '📅 Năm phát hành', value: selectedMovie.release_date?.split('-')[0] || 'N/A' },
                    { label: '⭐ Đánh giá IMDb', value: `${selectedMovie.vote_average}/10` },
                    { label: '👥 Lượt vote', value: selectedMovie.vote_count?.toLocaleString() || 'N/A' },
                    { label: '🌍 Ngôn ngữ', value: selectedMovie.original_language?.toUpperCase() || 'N/A' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px 0',
                      borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      <span style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: '500'
                      }}>
                        {item.label}
                      </span>
                      <span style={{
                        color: '#ffffff',
                        fontWeight: '600',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}

export default UserProfile;
