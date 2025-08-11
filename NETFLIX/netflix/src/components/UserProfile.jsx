import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
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
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileRes = await axios.get('http://localhost:8080/users/profile', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      setProfile(profileRes.data.data);

      // Fetch favorites
      const favoritesRes = await axios.get('http://localhost:8080/users/favorites', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      setFavorites(favoritesRes.data.data);

      // Fetch watch history
      const historyRes = await axios.get('http://localhost:8080/users/watch-history', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      setWatchHistory(historyRes.data.data);

    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Lỗi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (movieId) => {
    if (!confirm('Bạn có chắc muốn xóa khỏi danh sách yêu thích?')) return;

    try {
      await axios.delete(`http://localhost:8080/users/favorites/${movieId}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      setFavorites(favorites.filter(fav => fav.movieId._id !== movieId));
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
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-nav">
          <h1 onClick={goToMovies} style={{cursor: 'pointer'}}>🎬 Cinema</h1>
          <nav className="profile-tabs">
            <button 
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => setActiveTab('favorites')}
            >
              ❤️ Yêu thích ({favorites.length})
            </button>
            <button 
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              📺 Lịch sử xem ({watchHistory.length})
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              👤 Thông tin cá nhân
            </button>
          </nav>
          <div className="profile-user">
            <span>Xin chào, {userName}!</span>
            <button onClick={goToMovies} className="back-btn">← Quay lại</button>
            <button onClick={handleSignOut} className="sign-out-btn">Đăng xuất</button>
          </div>
        </div>
      </header>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="favorites-content">
          <div className="content-header">
            <h2>❤️ Phim yêu thích của bạn</h2>
            <p>Danh sách {favorites.length} bộ phim bạn đã thêm vào yêu thích</p>
          </div>

          {favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💔</div>
              <h3>Chưa có phim yêu thích nào</h3>
              <p>Hãy thêm những bộ phim bạn thích vào danh sách này!</p>
              <button onClick={goToMovies} className="browse-btn">
                Khám phá phim ngay
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {favorites.map(favorite => {
                const movie = favorite.movieId;
                return (
                  <div key={favorite._id} className="movie-card">
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
                        Thêm vào: {new Date(favorite.addedAt).toLocaleDateString('vi-VN')}
                      </p>
                      <button 
                        onClick={() => handleRemoveFromFavorites(movie._id)}
                        className="remove-btn"
                      >
                        🗑️ Xóa khỏi yêu thích
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Watch History Tab */}
      {activeTab === 'history' && (
        <div className="history-content">
          <div className="content-header">
            <h2>📺 Lịch sử xem phim</h2>
            <p>Danh sách {watchHistory.length} bộ phim bạn đã xem</p>
          </div>

          {watchHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📺</div>
              <h3>Chưa có lịch sử xem nào</h3>
              <p>Bắt đầu xem phim để tạo lịch sử của bạn!</p>
              <button onClick={goToMovies} className="browse-btn">
                Bắt đầu xem phim
              </button>
            </div>
          ) : (
            <div className="history-list">
              {watchHistory.map(history => {
                const movie = history.movieId;
                const watchDuration = history.watchDuration || 0;
                const watchPercentage = movie.runtime 
                  ? Math.min(Math.round((watchDuration / (movie.runtime * 60)) * 100), 100)
                  : 0;

                return (
                  <div key={history._id} className="history-item">
                    <div className="history-poster" onClick={() => handlePlayMovie(movie)}>
                      <img src={movie.poster_path} alt={movie.title} />
                      <div className="watch-progress">
                        <div 
                          className="progress-bar"
                          style={{ width: `${watchPercentage}%` }}
                        ></div>
                      </div>
                      <div className="play-overlay">
                        <button className="continue-btn">
                          {watchPercentage > 10 ? '▶️ Tiếp tục xem' : '▶️ Xem lại'}
                        </button>
                      </div>
                    </div>
                    <div className="history-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="rating">⭐ {movie.vote_average}</span>
                        <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                        <span className="duration">⏱️ {movie.runtime || 'N/A'} phút</span>
                      </div>
                      <div className="movie-genres">
                        {movie.genres?.slice(0, 3).map((genre, index) => (
                          <span key={index} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                      <p className="watch-info">
                        Xem lần cuối: {new Date(history.watchedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {watchPercentage > 0 && (
                        <p className="watch-progress-text">
                          Đã xem: {watchPercentage}% ({Math.floor(watchDuration / 60)} phút)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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

          <div className="profile-info">
            <div className="avatar-section">
              <div className="avatar">
                {profile.profile?.avatar ? (
                  <img src={profile.profile.avatar} alt="Avatar" />
                ) : (
                  <div className="default-avatar">
                    {profile.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button className="change-avatar-btn">Đổi ảnh đại diện</button>
            </div>

            <div className="info-section">
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên người dùng</label>
                  <p>{profile.userName}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>
                <div className="info-item">
                  <label>Vai trò</label>
                  <p className={`role-badge ${profile.role}`}>
                    {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
                <div className="info-item">
                  <label>Ngày tham gia</label>
                  <p>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="info-item">
                  <label>Số phim yêu thích</label>
                  <p>{favorites.length} phim</p>
                </div>
                <div className="info-item">
                  <label>Số phim đã xem</label>
                  <p>{watchHistory.length} phim</p>
                </div>
              </div>

              <div className="account-actions">
                <button className="edit-profile-btn">✏️ Chỉnh sửa thông tin</button>
                <button className="change-password-btn">🔒 Đổi mật khẩu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>
            
            <div className="modal-video">
              <iframe
                src={selectedMovie.video_url}
                title={selectedMovie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="modal-info">
              <h2 className="modal-title">{selectedMovie.title}</h2>
              <div className="modal-meta">
                <span className="rating">⭐ {selectedMovie.vote_average}</span>
                <span className="year">{new Date(selectedMovie.release_date).getFullYear()}</span>
                <span className="duration">⏱️ {selectedMovie.runtime || 'N/A'} phút</span>
              </div>
              <div className="modal-genres">
                {selectedMovie.genres?.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>
              <p className="modal-overview">{selectedMovie.overview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
