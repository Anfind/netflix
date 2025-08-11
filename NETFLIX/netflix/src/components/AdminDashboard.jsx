import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    backdrop_path: '',
    poster_path: '',
    overview: '',
    release_date: '',
    vote_average: '',
    video_url: '',
    genres: [],
    runtime: '',
    featured: false
  });

  const apiKey = localStorage.getItem('apiKey');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (!apiKey || userRole !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/signin');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashboardRes = await axios.get('http://localhost:8080/admin/dashboard', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      setStats(dashboardRes.data.data);

      // Fetch all movies
      const moviesRes = await axios.get('http://localhost:8080/movies');
      setMovies(moviesRes.data.data);

      // Fetch all users
      const usersRes = await axios.get('http://localhost:8080/admin/users', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      setUsers(usersRes.data.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...movieForm,
        vote_average: parseFloat(movieForm.vote_average),
        runtime: parseInt(movieForm.runtime),
        genres: movieForm.genres.filter(g => g.trim() !== '')
      };

      await axios.post('http://localhost:8080/movies', movieData, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      alert('Thêm phim thành công!');
      setShowAddMovie(false);
      resetMovieForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating movie:', error);
      alert('Lỗi thêm phim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...movieForm,
        vote_average: parseFloat(movieForm.vote_average),
        runtime: parseInt(movieForm.runtime),
        genres: movieForm.genres.filter(g => g.trim() !== '')
      };

      await axios.put(`http://localhost:8080/movies/${editMovie._id}`, movieData, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      alert('Cập nhật phim thành công!');
      setEditMovie(null);
      resetMovieForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Lỗi cập nhật phim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Bạn có chắc muốn xóa phim này?')) return;

    try {
      await axios.delete(`http://localhost:8080/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      alert('Xóa phim thành công!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Lỗi xóa phim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleFeatured = async (movieId) => {
    try {
      await axios.patch(`http://localhost:8080/movies/${movieId}/featured`, {}, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Lỗi cập nhật featured');
    }
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      backdrop_path: '',
      poster_path: '',
      overview: '',
      release_date: '',
      vote_average: '',
      video_url: '',
      genres: [],
      runtime: '',
      featured: false
    });
  };

  const handleEditMovie = (movie) => {
    setEditMovie(movie);
    setMovieForm({
      title: movie.title,
      backdrop_path: movie.backdrop_path,
      poster_path: movie.poster_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average.toString(),
      video_url: movie.video_url,
      genres: movie.genres || [],
      runtime: movie.runtime?.toString() || '',
      featured: movie.featured || false
    });
    setShowAddMovie(true);
  };

  const handleGenreChange = (index, value) => {
    const newGenres = [...movieForm.genres];
    newGenres[index] = value;
    setMovieForm({ ...movieForm, genres: newGenres });
  };

  const addGenreField = () => {
    setMovieForm({ ...movieForm, genres: [...movieForm.genres, ''] });
  };

  const removeGenreField = (index) => {
    const newGenres = movieForm.genres.filter((_, i) => i !== index);
    setMovieForm({ ...movieForm, genres: newGenres });
  };

  const handleSignOut = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-nav">
          <h1>🎬 Cinema Admin</h1>
          <nav className="admin-tabs">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={activeTab === 'movies' ? 'active' : ''}
              onClick={() => setActiveTab('movies')}
            >
              🎥 Quản lý Phim
            </button>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              👥 Quản lý Users
            </button>
          </nav>
          <div className="admin-user">
            <span>Admin Panel</span>
            <button onClick={handleSignOut} className="sign-out-btn">Đăng xuất</button>
          </div>
        </div>
      </header>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Tổng Users</h3>
              <p className="stat-number">{stats.users?.totalUsers || 0}</p>
              <span className="stat-label">Admin: {stats.users?.adminUsers || 0} | Users: {stats.users?.regularUsers || 0}</span>
            </div>
            <div className="stat-card">
              <h3>🎥 Tổng Phim</h3>
              <p className="stat-number">{stats.movies?.totalMovies || 0}</p>
              <span className="stat-label">Featured: {stats.movies?.featuredMovies || 0}</span>
            </div>
            <div className="stat-card">
              <h3>👁️ Tổng Views</h3>
              <p className="stat-number">{stats.movies?.totalViews || 0}</p>
              <span className="stat-label">Trung bình: {Math.round((stats.movies?.totalViews || 0) / (stats.movies?.totalMovies || 1))}</span>
            </div>
            <div className="stat-card">
              <h3>📅 Đăng ký gần đây</h3>
              <p className="stat-number">{stats.recentSignups || 0}</p>
              <span className="stat-label">7 ngày qua</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>🔥 Top Movies</h3>
            <div className="top-movies">
              {movies.slice(0, 5).map(movie => (
                <div key={movie._id} className="top-movie-item">
                  <img src={movie.poster_path} alt={movie.title} />
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>⭐ {movie.vote_average} | 👁️ {movie.view_count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Movies Management Tab */}
      {activeTab === 'movies' && (
        <div className="movies-content">
          <div className="movies-header">
            <h2>🎥 Quản lý Phim ({movies.length})</h2>
            <button 
              className="add-movie-btn"
              onClick={() => {
                setShowAddMovie(true);
                setEditMovie(null);
                resetMovieForm();
              }}
            >
              ➕ Thêm Phim Mới
            </button>
          </div>

          <div className="movies-grid">
            {movies.map(movie => (
              <div key={movie._id} className="movie-card">
                <div className="movie-poster">
                  <img src={movie.poster_path} alt={movie.title} />
                  {movie.featured && <span className="featured-badge">⭐ Featured</span>}
                </div>
                <div className="movie-details">
                  <h3>{movie.title}</h3>
                  <p className="movie-rating">⭐ {movie.vote_average} | 👁️ {movie.view_count}</p>
                  <p className="movie-year">{new Date(movie.release_date).getFullYear()}</p>
                  <div className="movie-genres">
                    {movie.genres?.slice(0, 2).map((genre, index) => (
                      <span key={index} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                  <div className="movie-actions">
                    <button onClick={() => handleEditMovie(movie)} className="edit-btn">✏️ Sửa</button>
                    <button 
                      onClick={() => handleToggleFeatured(movie._id)} 
                      className={`featured-btn ${movie.featured ? 'active' : ''}`}
                    >
                      ⭐ Featured
                    </button>
                    <button onClick={() => handleDeleteMovie(movie._id)} className="delete-btn">🗑️ Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="users-content">
          <h2>👥 Quản lý Users ({users.length})</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Ngày tạo</th>
                  <th>Favorites</th>
                  <th>Lịch sử</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.userName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>{user.favorites?.length || 0}</td>
                    <td>{user.watchHistory?.length || 0}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Movie Modal */}
      {showAddMovie && (
        <div className="modal-backdrop">
          <div className="movie-modal">
            <div className="modal-header">
              <h2>{editMovie ? '✏️ Chỉnh sửa Phim' : '➕ Thêm Phim Mới'}</h2>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowAddMovie(false);
                  setEditMovie(null);
                  resetMovieForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={editMovie ? handleUpdateMovie : handleCreateMovie} className="movie-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tiêu đề *</label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày phát hành *</label>
                  <input
                    type="date"
                    value={movieForm.release_date}
                    onChange={(e) => setMovieForm({ ...movieForm, release_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Điểm đánh giá (0-10) *</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={movieForm.vote_average}
                    onChange={(e) => setMovieForm({ ...movieForm, vote_average: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thời lượng (phút)</label>
                  <input
                    type="number"
                    min="1"
                    value={movieForm.runtime}
                    onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Backdrop URL *</label>
                <input
                  type="url"
                  value={movieForm.backdrop_path}
                  onChange={(e) => setMovieForm({ ...movieForm, backdrop_path: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/original/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Poster URL *</label>
                <input
                  type="url"
                  value={movieForm.poster_path}
                  onChange={(e) => setMovieForm({ ...movieForm, poster_path: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>YouTube Trailer URL *</label>
                <input
                  type="url"
                  value={movieForm.video_url}
                  onChange={(e) => setMovieForm({ ...movieForm, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả *</label>
                <textarea
                  value={movieForm.overview}
                  onChange={(e) => setMovieForm({ ...movieForm, overview: e.target.value })}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Thể loại</label>
                <div className="genres-input">
                  {movieForm.genres.map((genre, index) => (
                    <div key={index} className="genre-row">
                      <select
                        value={genre}
                        onChange={(e) => handleGenreChange(index, e.target.value)}
                      >
                        <option value="">Chọn thể loại</option>
                        <option value="Action">Action</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Animation">Animation</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Crime">Crime</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Drama">Drama</option>
                        <option value="Family">Family</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Horror">Horror</option>
                        <option value="Music">Music</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Romance">Romance</option>
                        <option value="Science Fiction">Science Fiction</option>
                        <option value="Thriller">Thriller</option>
                        <option value="War">War</option>
                        <option value="Western">Western</option>
                      </select>
                      <button type="button" onClick={() => removeGenreField(index)}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addGenreField} className="add-genre-btn">
                    ➕ Thêm thể loại
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={movieForm.featured}
                    onChange={(e) => setMovieForm({ ...movieForm, featured: e.target.checked })}
                  />
                  Đặt làm phim nổi bật (Featured)
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddMovie(false);
                    setEditMovie(null);
                    resetMovieForm();
                  }}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editMovie ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
