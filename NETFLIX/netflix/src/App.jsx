import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import MovieList from './components/MovieList';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [bannerMovie, setBannerMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null); 

  const FAQ_DATA = [
    {
      question: "Netflix là gì?",
      answer: "Netflix là dịch vụ phát trực tuyến mang đến đa dạng các loại series, phim, anime, phim tài liệu đoạt giải thưởng và nhiều nội dung khác trên hàng nghìn thiết bị có kết nối Internet. Bạn có thể xem bao nhiêu tùy thích, bất cứ lúc nào bạn muốn mà không gặp phải một quảng cáo nào – tất cả chỉ với một mức giá thấp hàng tháng. Luôn có những nội dung mới để bạn khám phá và những series, phim mới được bổ sung mỗi tuần!"
    },
    {
      question: "Tôi phải trả bao nhiêu tiền để xem Netflix?",
      answer: "Xem Netflix trên điện thoại thông minh, máy tính bảng, TV, máy tính xách tay hoặc thiết bị phát trực tuyến của bạn, tất cả chỉ với một khoản phí cố định hàng tháng. Gói dịch vụ từ 70.000 ₫ đến 260.000 ₫ mỗi tháng. Không có chi phí bổ sung, không có hợp đồng."
    },
    {
      question: "Tôi có thể xem ở đâu?",
      answer: "Xem ở mọi nơi, mọi lúc. Đăng nhập bằng tài khoản Netflix của bạn để xem ngay lập tức trên netflix.com từ máy tính cá nhân, hoặc trên bất kỳ thiết bị nào có kết nối Internet và ứng dụng Netflix, bao gồm TV thông minh, điện thoại thông minh, máy tính bảng, thiết bị phát media trực tuyến và máy chơi game. Bạn cũng có thể tải xuống các tựa phim yêu thích bằng ứng dụng iOS, Android hoặc Windows 10. Sử dụng tính năng tải xuống để xem khi đang di chuyển và không có kết nối Internet. Mang Netflix theo bạn đến bất cứ đâu."
    },
    {
      question: "Làm thế nào để hủy?",
      answer: "Netflix linh hoạt. Không có hợp đồng khó chịu và không có cam kết. Bạn có thể dễ dàng hủy tài khoản trực tuyến chỉ trong hai cú nhấp chuột. Không mất phí hủy – bạn có thể bắt đầu hoặc ngừng tài khoản bất cứ lúc nào."
    },
    {
      question: "Tôi có thể xem gì trên Netflix?",
      answer: "Netflix có một thư viện phong phú gồm phim truyện, phim tài liệu, chương trình truyền hình, anime, phim từng đoạt giải thưởng và nhiều nội dung khác. Xem không giới hạn bất cứ lúc nào bạn muốn."
    },
    {
      question: "Netflix có phù hợp cho trẻ em không?",
      answer: "Trải nghiệm Netflix trẻ em được đưa vào trong tư cách thành viên của bạn để giúp phụ huynh kiểm soát trong khi trẻ em được thưởng thức các series và phim thân thiện với gia đình trong không gian riêng của chúng. Hồ sơ trẻ em đi kèm với tính năng kiểm soát của phụ huynh, cho phép bạn hạn chế xếp hạng độ tuổi của nội dung mà trẻ em có thể xem và chặn các tựa phim cụ thể mà bạn không muốn chúng xem."
    },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:8080/movies');
        const result = await response.json();
        const allMovies = result.data;

        setMovies(allMovies);
        const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        setBannerMovie(randomMovie);
        setIsLoading(false);

      } catch (error) {
        console.error("Failed to fetch movies:", error);
        setIsLoading(false);
      }
    };

    fetchMovies();

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleToggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <header className='showcase'>
        <div className="showcase-top">
          <img src='./NetflixLogo.png' 
                alt="Netflix Logo"/>
          <button 
            className='btn btn-round'
            onClick={() => navigate('/signin')}>
            Đăng nhập
          </button>
        </div>

        <div className="showcase-content">
          <h1>Phim, series không giới hạn và nhiều nội dung khác</h1>
          <h3>Giá từ 70.000 ₫. Hủy bất kỳ lúc nào.</h3>
          <p>Bạn đã sẵn sàng xem chưa? Nhập email để tạo hoặc kích hoạt lại tư cách thành viên của bạn.</p>
          <div className="input">
            <input type="email" name="email" id="mail" placeholder="Email address" />
            <a onClick={() => navigate('/signup')} className="btn btn-lg">
              BẮT ĐẦU »
            </a>
          </div>
        </div>
      </header>
      
      <section className='style-cards'>
        <div className="card-0">
          <img src='./kid.jpg' alt='"Netflix Mobile"'/> 
            <div className="desc-0">
              <h1>Tạo hồ sơ cho trẻ em</h1>
              <h3>Đưa các em vào những cuộc phiêu lưu với nhân vật được yêu thích trong một không gian riêng. Tính năng này đi kèm miễn phí với tư cách thành viên của bạn</h3>
            </div>
        </div>

        <div className="card-1">
          <div className="desc-1">
            <h1>Thưởng thức trên TV của bạn</h1>
            <h3>Xem trên TV thông minh, Playstation, Xbox, Chromecast, Apple TV, đầu phát Blu-ray và nhiều thiết bị khác.</h3>
          </div>
          <img src='./tv.png' alt="Netflix TV"/> 
        </div>

        <div className="card-2">
          <img src='./phone.jpg' alt="Netflix Mobile"/> 
          <div className="desc-2">
            <h1>Tải xuống nội dung để xem ngoại tuyến</h1>
            <h3>Lưu lại những nội dung yêu thích một cách dễ dàng và luôn có thứ để xem.</h3>
          </div> 
        </div>

        <div className="card-3">
          <div className="desc-3">
            <h1>Xem ở mọi nơi</h1>
            <h3>Phát trực tuyến không giới hạn phim và series trên điện thoại, máy tính bảng, máy tính xách tay và TV.</h3>
          </div>
          <img src='./mac.png' alt="Device-Pile-In"/>
        </div>
      </section>

      <section className="lastsec">
        <div className="faq">
          <h1>Câu hỏi thường gặp</h1>
          <ul className="questions">
            {FAQ_DATA.map((item, index) => (
              <li key={index} className={openFAQ === index ? 'open' : ''}>
                <button className="faq-question-button" onClick={() => handleToggleFAQ(index)}>
                  {item.question}
                  <span className="faq-icon">{openFAQ === index ? '×' : '+'}</span>
                </button>
                {openFAQ === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
            <p>Bạn đã sẵn sàng xem chưa? Nhập email để tạo hoặc kích hoạt lại tư cách thành viên của bạn.</p>
            <div className="input">
              <input type="email" name="email" placeholder="Email Address" />
              <a href="#" className="btn btn-lg">GET STARTED </a>
            </div>
        </div>
      </section>  

      <footer className="footer">
        <p>Bạn có câu hỏi? Liên hệ với chúng tôi.</p>
        <div className="footer-cols">
        <ul>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Trung tâm đa phương tiện</a></li>
            <li><a href="#">Các cách xem</a></li>
            <li><a href="#">Kiểm tra tốc độ</a></li>
        </ul> 
        <ul>
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Quan hệ với nhà đầu tư</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Thông báo pháp lý</a></li>
        </ul>
        <ul>
            <li><a href="#">Tài khoản</a></li>
            <li><a href="#">Việc làmm</a></li>
            <li><a href="#">Quyền riêng tư</a></li>
            <li><a href="#">Liên hệ với chúng tôi</a></li>
        </ul>
        <ul>
            <li><a href="#">Chỉ có trên Netflix</a></li>
            <li><a href="#">Thông tin doanh nghiệp</a></li>
            <li><a href="#">Tùy chọn cookie</a></li>
            <li><a href="#">Netflix Originals</a></li>
        </ul>
</div>
</footer>
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
              <button className="banner-button">Play</button>
              <button className="banner-button">More Info</button>
            </div>
            <h1 className="banner-description">
              {bannerMovie.overview}
            </h1>
          </div>
          <div className="banner-fadeBottom" />
        </header>
      )}

      <div className="rows">
        <div className="row">
          <div className="row-header">
            <h2 className="row-title">Trending Now</h2>
          </div>
          <div className="row-posters">
            {movies.map(movie => (
              <img
                key={movie._id} 
                className="row-poster"
                src={movie.poster_path}
                alt={movie.title}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        </div>

        <div className="row">
          <div className="row-header">
            <h2 className="row-title">Popular on Netflix</h2>
          </div>
          <div className="row-posters">
            {movies.map(movie => (
              <img
                key={movie._id} 
                className="row-poster row-posterLarge"
                src={movie.poster_path}
                alt={movie.title}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        </div>
      </div>


      {selectedMovie && (
        <div className="movie-modal">
          <span 
            className="modal-close"
            onClick={() => setSelectedMovie(null)}
          >
            ×
          </span>
          <div className="modal-content">
            <h2 className="modal-title">{selectedMovie.title}</h2>
            <div className="modal-info">
              <span>{selectedMovie.release_date}</span>
              <span>Rating: {selectedMovie.vote_average}</span>
            </div>
            <p className="modal-overview">{selectedMovie.overview}</p>
            <div className="modal-buttons">
              <button className="modal-button play">Play</button>
              <button className="modal-button more-info">More Info</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={
          <div className="auth-page">
            <SignIn />
          </div>
        } />
        <Route path="/signup" element={
          <div className="auth-page">
            <SignUp />
          </div>
        } />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;