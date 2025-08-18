import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import API_BASE_URL from '../config/api';
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

  // Debug selected movie state
  useEffect(() => {
    console.log('Selected movie state changed:', selectedMovie);
    if (selectedMovie) {
      console.log('Modal should be visible now for:', selectedMovie.title);
      // Tắt scroll của body khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      console.log('Modal should be hidden now');
      // Bật lại scroll khi modal đóng
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMovie]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movies`);
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
      await fetch(`${API_BASE_URL}/users/favorites/${movie._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Hiển thị thông báo đẹp hơn
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, rgba(229,9,20,0.95) 0%, rgba(190,8,17,0.95) 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          z-index: 999999;
          box-shadow: 0 8px 25px rgba(229,9,20,0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          animation: slideInRight 0.4s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          ❤️ Đã thêm "${movie.title}" vào yêu thích!
        </div>
      `;
      document.body.appendChild(notification);
      
      // Tự động xóa thông báo sau 3 giây
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
      
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
            <li>
              <a onClick={() => {
                console.log('Navigating to profile/favorites');
                navigate('/profile', { state: { activeTab: 'favorites' } });
              }} style={{cursor: 'pointer', color: '#e50914'}}>
                ❤️ Yêu thích
              </a>
            </li>
            <li>
              <a onClick={() => {
                console.log('Navigating to profile');
                navigate('/profile');
              }} style={{cursor: 'pointer'}}>
                👤 Profile
              </a>
            </li>
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
                    console.log('Movie poster clicked:', movie.title);
                    console.log('Setting selectedMovie to:', movie);
                    setSelectedMovie(movie);
                    setShowVideo(false); 
                    console.log('State updated - selectedMovie should be set');
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Movie Modal - Fullscreen Design */}
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
              setSelectedMovie(null);
              setShowVideo(false);
            }
          }}
        >
          {console.log('Rendering modal for:', selectedMovie.title)}
          
          {/* Scroll Indicator */}
          <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2147483640,
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 2s ease'
          }}>
            <span>Cuộn để xem thêm</span>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255,255,255,0.5)',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'rotate(45deg)',
              animation: 'bounce 2s infinite'
            }} />
          </div>
          
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
            onClick={() => {
              console.log('Closing modal');
              setSelectedMovie(null);
              setShowVideo(false);
            }}
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
            {showVideo && (selectedMovie.video_url || selectedMovie.trailer_url) ? (
              <div style={{
                width: '100%',
                height: '100vh',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`${selectedMovie.video_url || selectedMovie.trailer_url}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  title={selectedMovie.title}
                  style={{
                    border: 'none',
                    borderRadius: '0'
                  }}
                />
              </div>
            ) : (
              <>
                {/* Hero Section with Premium Design */}
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
                  {/* Floating particles effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 30%, rgba(229,9,20,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(229,9,20,0.05) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none'
                  }} />
                  
                  <div style={{ 
                    color: 'white', 
                    zIndex: 2, 
                    maxWidth: window.innerWidth > 768 ? '55%' : '90%',
                    transform: 'translateY(0)',
                    animation: 'slideInUp 0.6s ease'
                  }}>
                    <h1 style={{ 
                      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                      fontWeight: '700',
                      marginBottom: '25px',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
                      lineHeight: '1.1',
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
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
                        🎬 {selectedMovie.genres?.slice(0,2).join(', ') || 'Phim'}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '1.3rem',
                      lineHeight: '1.7',
                      marginBottom: '35px',
                      maxWidth: '90%',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                      color: 'rgba(255,255,255,0.95)',
                      fontWeight: '400'
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
                          opacity: 1
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05) translateY(-2px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1) translateY(0px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                        }}
                        onClick={() => {
                          if (selectedMovie.video_url || selectedMovie.trailer_url) {
                            setShowVideo(true);
                          } else {
                            alert('Video trailer chưa có sẵn cho phim này!');
                          }
                        }}
                      >
                        ▶ Phát ngay
                      </button>
                      
                      <button
                        style={{
                          padding: '18px 35px',
                          background: 'rgba(109,109,110,0.8)',
                          color: 'white',
                          border: '2px solid rgba(255,255,255,0.2)',
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
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(229,9,20,0.8)';
                          e.target.style.borderColor = 'rgba(229,9,20,0.8)';
                          e.target.style.transform = 'scale(1.05) translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(109,109,110,0.8)';
                          e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.target.style.transform = 'scale(1) translateY(0px)';
                        }}
                        onClick={() => handleAddToFavorites(selectedMovie)}
                      >
                        ❤ Yêu thích
                      </button>
                      
                      <button
                        style={{
                          padding: '18px 35px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '2px solid rgba(255,255,255,0.3)',
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
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.2)';
                          e.target.style.transform = 'scale(1.05) translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.1)';
                          e.target.style.transform = 'scale(1) translateY(0px)';
                        }}
                      >
                        ➕ Danh sách
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Details Section */}
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
                    {/* Left Column - Description */}
                    <div style={{
                      animation: 'fadeInLeft 0.6s ease'
                    }}>
                      <h2 style={{ 
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '25px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Về bộ phim này
                      </h2>
                      
                      <p style={{ 
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: 'rgba(255,255,255,0.9)',
                        marginBottom: '30px',
                        textAlign: 'justify'
                      }}>
                        {selectedMovie.overview}
                      </p>
                      
                      {/* Tags */}
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
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      animation: 'fadeInRight 0.6s ease'
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
                        { label: '🌍 Ngôn ngữ', value: selectedMovie.original_language?.toUpperCase() || 'N/A' },
                        { label: '🏷️ Mã phim', value: `#${selectedMovie._id?.slice(-6) || 'N/A'}` }
                      ].map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px 0',
                          borderBottom: index < 5 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                          <span style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: '500',
                            fontSize: '1rem'
                          }}>
                            {item.label}
                          </span>
                          <span style={{
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '1rem',
                            textAlign: 'right',
                            maxWidth: '60%'
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                      
                      {/* Popularity Bar */}
                      <div style={{
                        marginTop: '25px',
                        padding: '20px 0'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            Độ phổ biến
                          </span>
                          <span style={{ color: '#ffffff', fontWeight: '600' }}>
                            {Math.round((selectedMovie.vote_average / 10) * 100)}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(selectedMovie.vote_average / 10) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #e50914 0%, #ff6b6b 100%)',
                            borderRadius: '4px',
                            transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
}

export default MovieList;