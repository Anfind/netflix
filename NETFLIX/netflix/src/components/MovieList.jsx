import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

  const CATEGORIES = [
    { name: "Phim thịnh hành", key: "trending", type: "large" },
    { name: "Netflix Originals", key: "netflixOriginals", type: "normal" },
    { name: "Hành động", key: "action", type: "normal" },
    { name: "Khoa học viễn tưởng", key: "scifi", type: "normal" },
    { name: "Kinh dị", key: "horror", type: "normal" },
    { name: "Hài hước", key: "comedy", type: "normal" },
    { name: "Tài liệu", key: "documentaries", type: "normal" },
  ];

function shuffleArray(array) {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function MovieList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState({});
  const [bannerMovie, setBannerMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:8080/movies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const allMovies = result.data;

        const fetchedMovies = {};
        
        // Organize movies by categories with better distribution
        const organizeMoviesByCategory = (movieList) => {
          const shuffledMovies = shuffleArray(movieList);
          
          const actionMovies = shuffledMovies.filter(movie => 
            movie.genres?.some(genre => 
              ['Action', 'Adventure', 'Crime'].includes(genre)
            )
          );
          
          const scifiMovies = shuffledMovies.filter(movie => 
            movie.genres?.some(genre => 
              ['Science Fiction', 'Fantasy', 'Adventure'].includes(genre)
            )
          );
          
          const horrorMovies = shuffledMovies.filter(movie => 
            movie.genres?.some(genre => 
              ['Horror', 'Thriller', 'Mystery'].includes(genre)
            )
          );
          
          const comedyMovies = shuffledMovies.filter(movie => 
            movie.genres?.some(genre => 
              ['Comedy', 'Romance', 'Family'].includes(genre)
            )
          );
          
          return {
            trending: shuffledMovies.filter(movie => movie.trending || movie.featured).slice(0, 15) || shuffledMovies.slice(0, 15),
            netflixOriginals: shuffledMovies.filter(movie => movie.featured || movie.vote_average >= 8.0).slice(0, 15) || shuffledMovies.slice(3, 18),
            action: actionMovies.slice(0, 15).length >= 8 ? actionMovies.slice(0, 15) : shuffledMovies.slice(0, 15),
            scifi: scifiMovies.slice(0, 15).length >= 8 ? scifiMovies.slice(0, 15) : shuffledMovies.slice(2, 17),
            horror: horrorMovies.slice(0, 15).length >= 8 ? horrorMovies.slice(0, 15) : shuffledMovies.slice(4, 19),
            comedy: comedyMovies.slice(0, 15).length >= 8 ? comedyMovies.slice(0, 15) : shuffledMovies.slice(1, 16),
            documentaries: shuffledMovies.slice(5, 20)
          };
        };
        
        const organizedMovies = organizeMoviesByCategory(allMovies);
        
        CATEGORIES.forEach(category => {
          fetchedMovies[category.key] = organizedMovies[category.key] || shuffleArray(allMovies).slice(0, 15);
        });
        setMovies(fetchedMovies);
        const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        setBannerMovie(randomMovie);

      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  const handleSignOut = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  const handleAddToFavorites = async (movie) => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      navigate('/signin');
      return;
    }

    try {
      await fetch(`http://localhost:8080/users/favorites/${movie._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      alert(`Đã thêm "${movie.title}" vào danh sách yêu thích!`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Lỗi khi thêm vào yêu thích');
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  return (
    <div className="movie-list-page" id="top">
      <div className={`showcase-top ${isScrolled ? 'scrolled' : ''}`}>
        <img src="/NetflixLogo.png" alt="Netflix Logo" className="logo" onClick={() => navigate('/movies')} />
        <nav className="main-nav">  
          <ul className="nav-links">
            <li><a href="#top" className="active">Trang chủ</a></li>
            <li><a href="#action">Phim lẻ</a></li>
            <li><a href="#trending">Mới & Phổ biến</a></li>
            <li><a onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>❤️ Yêu thích</a></li>
            <li><a onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>👤 Profile</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="btn" onClick={handleSignOut}>Đăng xuất</button>
          <div className="menu-icon-container">
              <button className="menu-icon" onClick={toggleUserMenu}>
                  <i className="fas fa-bars"></i>
              </button>
              {showUserMenu && (
                  <div className="user-menu-dropdown" ref={userMenuRef}>
                      <div className="user-profile">
                          <img src="/nf.png" alt="Profile" className="profile-avatar" />
                          <span>Xin chào, User!</span>
                      </div>
                      <ul className="user-menu-links">
                          <li><a href="#account">Tài khoản</a></li>
                          <li><a href="#help">Trung tâm trợ giúp</a></li>
                          <li><a href="#" onClick={handleSignOut}>Đăng xuất</a></li>
                      </ul>
                  </div>
              )}
          </div>
        </div>
      </div>

      {bannerMovie && (
        <header
          className="banner"
          style={{
            backgroundImage: `url(${bannerMovie.backdrop_path})`,
          }}
        >
          <div className="banner-contents">
            <h1 className="banner-title">
              {bannerMovie.title}
            </h1>
            <div className="banner-buttons">
              <button
                className="banner-button play"
                onClick={() => {
                  setSelectedMovie(bannerMovie);
                  if (bannerMovie.video_url) {
                    setShowVideo(true);
                  }
                }}
              >
                <i className="fas fa-play"></i> Play
              </button>
              <button
                className="banner-button more-info"
                onClick={() => {
                  setSelectedMovie(bannerMovie);
                  setShowVideo(false);
                }}
              >
                <i className="fas fa-info-circle"></i> More Info
              </button>
              <button
                className="banner-button favorite"
                onClick={() => handleAddToFavorites(bannerMovie)}
              >
                <i className="fas fa-heart"></i> Yêu thích
              </button>
            </div>
            <h1 className="banner-description">
              {truncate(bannerMovie.overview, 150)}
            </h1>
          </div>
          <div className="banner-fadeBottom"></div>
        </header>
      )}

      <div className="rows">
        {CATEGORIES.map(category => (
          <div className="row" key={category.key} id={category.key}>
            <h2 className="row-title">{category.name}</h2>
            <div className="row-posters">
              {movies[category.key]?.map(movie => (
                <img
                  key={movie._id} // Sử dụng movie._id thay vì movie.id
                  className={`row-poster ${category.type === 'large' ? 'row-posterLarge' : ''}`}
                  src={movie.poster_path}
                  alt={movie.title}
                  onClick={() => {
                    setSelectedMovie(movie);
                    setShowVideo(false); 
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="movie-modal">
          <span
            className="modal-close"
            onClick={() => {
              setSelectedMovie(null);
              setShowVideo(false);
            }}
          >
            ×
          </span>
          <div className="modal-content">
            {showVideo && selectedMovie.video_url ? (
              <div className="video-container">
                <iframe
                  width="100%"
                  height="400px"
                  src={selectedMovie.video_url}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedMovie.title}
                ></iframe>
              </div>
            ) : (
              <>
                <h2 className="modal-title">{selectedMovie.title}</h2>
                <div className="modal-info">
                  <span>{selectedMovie.release_date}</span>
                  <span>Rating: {selectedMovie.vote_average} / 10</span>
                </div>
                <p className="modal-overview">{selectedMovie.overview}</p>
                <div className="modal-buttons">
                  <button
                    className="modal-button play"
                    onClick={() => setShowVideo(true)}
                    disabled={!selectedMovie.video_url}
                  >
                    <i className="fas fa-play"></i> Play
                  </button>
                  <button className="modal-button more-info"><i className="fas fa-plus"></i> Add to My List</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieList;