import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look for .env in parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import User from '../models/users.model.js';
import Movie from '../models/movies.model.js';

const seedData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌍 Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create Admin User
    const admin = new User({
      userName: 'admin',
      username: 'admin',
      email: 'admin@netflix.com',
      password: 'admin123', // Will be hashed by the model
      role: 'admin',
      fullName: 'Administrator',
      phone: '+84901234567',
      dateOfBirth: new Date('1990-01-01'),
      favorites: []
    });

    // Create Regular Users
    const user1 = new User({
      userName: 'testuser1',
      username: 'testuser1',
      email: 'user1@gmail.com',
      password: 'user123',
      role: 'user',
      fullName: 'Nguyễn Văn A',
      phone: '+84987654321',
      dateOfBirth: new Date('1995-05-15'),
      favorites: []
    });

    const user2 = new User({
      userName: 'testuser2',
      username: 'testuser2',
      email: 'user2@gmail.com',
      password: 'user123',
      role: 'user',
      fullName: 'Trần Thị B',
      phone: '+84912345678',
      dateOfBirth: new Date('1998-08-20'),
      favorites: []
    });

    // Save users
    await admin.save();
    await user1.save();
    await user2.save();
    console.log('👥 Created 1 admin and 2 users');

    // Create 20 Sample Movies
    const movies = [
      {
        title: 'Avengers: Endgame',
        description: 'Sau các sự kiện tàn khốc của Avengers: Infinity War, vũ trụ đang trong tình trạng hỗn loạn. Với sự giúp đỡ của các đồng minh còn lại, các Avengers phải tập hợp một lần nữa để đảo ngược hành động của Thanos và khôi phục lại trật tự cho vũ trụ.',
        genre: ['Action', 'Adventure', 'Drama'],
        releaseDate: new Date('2019-04-26'),
        duration: 181,
        director: 'Anthony Russo, Joe Russo',
        cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
        rating: 8.4,
        poster_path: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        video_url: 'https://www.youtube.com/embed/TcMBFSGVi1c?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/TcMBFSGVi1c',
        language: 'English',
        country: 'USA',
        budget: 356000000,
        revenue: 2797800564,
        status: 'Released'
      },
      {
        title: 'Spider-Man: No Way Home',
        description: 'Lần đầu tiên trong lịch sử điện ảnh của Spider-Man, danh tính của Người Hùng Thân Thiện hàng xóm bị lộ, khiến Peter Parker không còn có thể tách biệt cuộc sống bình thường với vai trò siêu anh hùng.',
        genre: ['Action', 'Adventure', 'Fantasy'],
        releaseDate: new Date('2021-12-17'),
        duration: 148,
        director: 'Jon Watts',
        cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Jacob Batalon', 'Jon Favreau'],
        rating: 8.2,
        poster_path: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
        video_url: 'https://www.youtube.com/embed/JfVOs4VSpmA?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/JfVOs4VSpmA',
        language: 'English',
        country: 'USA',
        budget: 200000000,
        revenue: 1921847111,
        status: 'Released'
      },
      {
        title: 'The Batman',
        description: 'Khi kẻ giết người hàng loạt nhắm vào những nhân vật chính trị hàng đầu của Gotham, Batman phải khám phá những manh mối và đưa ra phán quyết về tương lai của thành phố cũng như gia đình mình.',
        genre: ['Action', 'Crime', 'Drama'],
        releaseDate: new Date('2022-03-04'),
        duration: 176,
        director: 'Matt Reeves',
        cast: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright', 'Colin Farrell', 'Paul Dano'],
        rating: 7.8,
        poster_path: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/5P8SmMzSNYikXpxil6BYzJ16611.jpg',
        video_url: 'https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/mqqft2x_Aa4',
        language: 'English',
        country: 'USA',
        budget: 185000000,
        revenue: 771000000,
        status: 'Released'
      },
      {
        title: 'Top Gun: Maverick',
        description: 'Sau hơn ba mười năm phục vụ như một trong những phi công hàng đầu của Hải quân, Pete "Maverick" Mitchell đang ở nơi anh thuộc về, thúc đẩy phong bì như một phi công thử nghiệm dũng cảm.',
        genre: ['Action', 'Drama'],
        releaseDate: new Date('2022-05-27'),
        duration: 130,
        director: 'Joseph Kosinski',
        cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm', 'Glen Powell'],
        rating: 8.3,
        poster_path: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',
        video_url: 'https://www.youtube.com/embed/qSqVVswa420?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/qSqVVswa420',
        language: 'English',
        country: 'USA',
        budget: 170000000,
        revenue: 1488732821,
        status: 'Released'
      },
      {
        title: 'Black Panther: Wakanda Forever',
        description: 'Nữ hoàng Ramonda, Shuri, M\'Baku, Okoye và Dora Milaje chiến đấu để bảo vệ quốc gia của họ khỏi các thế lực can thiệp sau cái chết của Vua T\'Challa.',
        genre: ['Action', 'Adventure', 'Drama'],
        releaseDate: new Date('2022-11-11'),
        duration: 161,
        director: 'Ryan Coogler',
        cast: ['Letitia Wright', 'Lupita Nyong\'o', 'Danai Gurira', 'Winston Duke', 'Angela Bassett'],
        rating: 6.7,
        poster_path: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/yOm993lsJyPmBodlYjgpPwMfUC.jpg',
        video_url: 'https://www.youtube.com/embed/_Z3QKkl1WyM?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/_Z3QKkl1WyM',
        language: 'English',
        country: 'USA',
        budget: 250000000,
        revenue: 859208423,
        status: 'Released'
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully sống với gia đình mới được thành lập trên hành tinh Pandora. Khi một mối đe dọa quen thuộc trở lại để hoàn thành những gì đã bắt đầu trước đây, Jake phải làm việc với Neytiri và quân đội của chủng tộc Na\'vi để bảo vệ hành tinh của họ.',
        genre: ['Action', 'Adventure', 'Family'],
        releaseDate: new Date('2022-12-16'),
        duration: 192,
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang', 'Kate Winslet'],
        rating: 7.6,
        poster_path: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
        video_url: 'https://www.youtube.com/embed/d9MyW72ELq0?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/d9MyW72ELq0',
        language: 'English',
        country: 'USA',
        budget: 460000000,
        revenue: 2320250281,
        status: 'Released'
      },
      {
        title: 'Joker',
        description: 'Trong Gotham City năm 1981, một diễn viên hài thất bại được xã hội từ chối và quay lưng lại để trở thành một tội phạm tâm thần và một biểu tượng hỗn loạn.',
        genre: ['Crime', 'Drama', 'Thriller'],
        releaseDate: new Date('2019-10-04'),
        duration: 122,
        director: 'Todd Phillips',
        cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz', 'Frances Conroy', 'Brett Cullen'],
        rating: 8.4,
        poster_path: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
        video_url: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/zAGVQLHvwOY',
        language: 'English',
        country: 'USA',
        budget: 55000000,
        revenue: 1074251311,
        status: 'Released'
      },
      {
        title: 'Dune',
        description: 'Một nhóm quý tộc trẻ tuổi được giao nhiệm vụ bảo vệ tài sản quý giá nhất và yếu tố quan trọng nhất trong thiên hà.',
        genre: ['Action', 'Adventure', 'Drama'],
        releaseDate: new Date('2021-10-22'),
        duration: 155,
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Josh Brolin', 'Stellan Skarsgård'],
        rating: 8.0,
        poster_path: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/iopYFB1b6Bh7FWZh3onQhph1sih.jpg',
        video_url: 'https://www.youtube.com/embed/8g18jFHCLXk?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/8g18jFHCLXk',
        language: 'English',
        country: 'USA',
        budget: 165000000,
        revenue: 402000000,
        status: 'Released'
      },
      {
        title: 'Parasite',
        description: 'Tham vọng của một gia đình nghèo và sự ngây thơ của một gia đình giàu có dẫn đến một chuỗi sự kiện bất ngờ.',
        genre: ['Comedy', 'Drama', 'Thriller'],
        releaseDate: new Date('2019-05-30'),
        duration: 132,
        director: 'Bong Joon Ho',
        cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
        rating: 8.5,
        poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkBcQZzr.jpg',
        video_url: 'https://www.youtube.com/embed/5xH0HfJHsaY?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/5xH0HfJHsaY',
        language: 'English',
        country: 'South Korea',
        budget: 11400000,
        revenue: 262000000,
        status: 'Released'
      },
      {
        title: 'Interstellar',
        description: 'Một nhóm thám hiểm viên sử dụng một lỗ sâu mới được phát hiện để vượt qua giới hạn du hành vũ trụ của con người và chinh phục khoảng cách khổng lồ trong một chuyến du hành liên sao.',
        genre: ['Adventure', 'Drama', 'Sci-Fi'],
        releaseDate: new Date('2014-11-07'),
        duration: 169,
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Bill Irwin', 'Ellen Burstyn'],
        rating: 8.6,
        poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
        video_url: 'https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/zSWdZVtXT7E',
        language: 'English',
        country: 'USA',
        budget: 165000000,
        revenue: 677000000,
        status: 'Released'
      },
      {
        title: 'Inception',
        description: 'Một tên trộm được cho cơ hội để được xóa hồ sơ tội phạm của mình để đổi lấy một nhiệm vụ được cho là không thể thực hiện được: cấy ghép.',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        releaseDate: new Date('2010-07-16'),
        duration: 148,
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Elliot Page', 'Ken Watanabe'],
        rating: 8.8,
        poster_path: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/aej3LRUga5rhgkmRP6XMFw3ejbl.jpg',
        video_url: 'https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/YoHD9XEInc0',
        language: 'English',
        country: 'USA',
        budget: 160000000,
        revenue: 836800000,
        status: 'Released'
      },
      {
        title: 'The Dark Knight',
        description: 'Khi mối đe dọa được gọi là Joker tàn phá và gây hỗn loạn cho người dân Gotham, Người Dơi phải chấp nhận một trong những thử thách tâm lý và thể chất lớn nhất để chống lại sự bất công.',
        genre: ['Action', 'Crime', 'Drama'],
        releaseDate: new Date('2008-07-18'),
        duration: 152,
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Maggie Gyllenhaal'],
        rating: 9.0,
        poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
        video_url: 'https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        language: 'English',
        country: 'USA',
        budget: 185000000,
        revenue: 1006000000,
        status: 'Released'
      },
      {
        title: 'Pulp Fiction',
        description: 'Cuộc sống của hai sát thủ mafia, một võ sĩ quyền anh, vợ của một gangster và một cặp cướp nhà hàng đan xen trong bốn câu chuyện về bạo lực và chuộc tội.',
        genre: ['Crime', 'Drama'],
        releaseDate: new Date('1994-10-14'),
        duration: 154,
        director: 'Quentin Tarantino',
        cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis', 'Ving Rhames'],
        rating: 8.9,
        poster_path: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        video_url: 'https://www.youtube.com/embed/s7EdQ4FqbhY?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/s7EdQ4FqbhY',
        language: 'English',
        country: 'USA',
        budget: 8000000,
        revenue: 214200000,
        status: 'Released'
      },
      {
        title: 'The Shawshank Redemption',
        description: 'Hai người đàn ông bị giam cầm hình thành tình bạn trong nhiều năm, tìm thấy sự an ủi và cuối cùng là sự cứu chuộc thông qua các hành động của lòng trắc ẩn và hy vọng chung.',
        genre: ['Drama'],
        releaseDate: new Date('1994-09-23'),
        duration: 142,
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler', 'Clancy Brown'],
        rating: 9.3,
        poster_path: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
        video_url: 'https://www.youtube.com/embed/6hB3S9bIaco?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/6hB3S9bIaco',
        language: 'English',
        country: 'USA',
        budget: 25000000,
        revenue: 16000000,
        status: 'Released'
      },
      {
        title: 'Forrest Gump',
        description: 'Cuộc đời của Forrest Gump, một người Alabama có chỉ số IQ 75, và cuộc hành trình của anh ấy qua thế giới từ những năm 1950 đến 1970.',
        genre: ['Drama', 'Romance'],
        releaseDate: new Date('1994-07-06'),
        duration: 142,
        director: 'Robert Zemeckis',
        cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise', 'Sally Field', 'Mykelti Williamson'],
        rating: 8.8,
        poster_path: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/7c8obl4XlbdTjsLdl9h67Mt8rrk.jpg',
        video_url: 'https://www.youtube.com/embed/bLvqoHBptjg?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/bLvqoHBptjg',
        language: 'English',
        country: 'USA',
        budget: 55000000,
        revenue: 678200000,
        status: 'Released'
      },
      {
        title: 'The Godfather',
        description: 'Tộc trưởng già của một triều đại tội phạm tổ chức chuyển giao quyền kiểm soát đế chế bí mật của mình cho con trai miễn cưỡng của mình.',
        genre: ['Crime', 'Drama'],
        releaseDate: new Date('1972-03-24'),
        duration: 175,
        director: 'Francis Ford Coppola',
        cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Diane Keaton', 'Robert Duvall'],
        rating: 9.2,
        poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        video_url: 'https://www.youtube.com/embed/sY1S34973zA?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/sY1S34973zA',
        language: 'English',
        country: 'USA',
        budget: 6000000,
        revenue: 246120974,
        status: 'Released'
      },
      {
        title: 'Titanic',
        description: 'Một quý tộc trẻ tuổi rơi vào tình yêu với một nghệ sĩ nghèo khó trên chuyến hành trình đầu tiên của RMS Titanic xấu số.',
        genre: ['Drama', 'Romance'],
        releaseDate: new Date('1997-12-19'),
        duration: 194,
        director: 'James Cameron',
        cast: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane', 'Kathy Bates', 'Frances Fisher'],
        rating: 7.9,
        poster_path: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/kHXEpyfl6zqn8a6YuozZUujufXf.jpg',
        video_url: 'https://www.youtube.com/embed/2e-eXJ6HgkQ?autoplay=1&mute=1&controls=1&rel=0',
        trailer_url: 'https://www.youtube.com/embed/2e-eXJ6HgkQ',
        language: 'English',
        country: 'USA',
        budget: 200000000,
        revenue: 2201647264,
        status: 'Released'
      },
      {
        title: 'The Matrix',
        description: 'Một hacker máy tính tìm hiểu từ những kẻ nổi loạn bí ẩn về bản chất thực sự của thực tế của mình và vai trò của mình trong cuộc chiến chống lại những người điều khiển nó.',
        genre: ['Action', 'Sci-Fi'],
        releaseDate: new Date('1999-03-31'),
        duration: 136,
        director: 'Lana Wachowski, Lilly Wachowski',
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving', 'Gloria Foster'],
        rating: 8.7,
        poster_path: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
        language: 'English',
        country: 'USA',
        budget: 63000000,
        revenue: 465300000,
        status: 'Released'
      },
      {
        title: 'Goodfellas',
        description: 'Câu chuyện về Henry Hill và cuộc sống của anh ấy trong mob, bao gồm mối quan hệ của anh ấy với vợ Karen Hill và các đối tác mob của anh ấy Jimmy Conway và Tommy DeVito.',
        genre: ['Biography', 'Crime', 'Drama'],
        releaseDate: new Date('1990-09-19'),
        duration: 146,
        director: 'Martin Scorsese',
        cast: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci', 'Lorraine Bracco', 'Paul Sorvino'],
        rating: 8.7,
        poster_path: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/sw7mordbZxgITU877yTpaNqi4Z.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=qo5jJpHtI1Y',
        language: 'English',
        country: 'USA',
        budget: 25000000,
        revenue: 46836394,
        status: 'Released'
      },
      {
        title: 'Squid Game',
        description: 'Hàng trăm người chơi sâu trong nợ nần cạnh tranh trong một loạt các trò chơi dành cho trẻ em với giải thưởng tiền khổng lồ, nhưng cổ phần là sinh tử.',
        genre: ['Action', 'Drama', 'Mystery'],
        releaseDate: new Date('2021-09-17'),
        duration: 480, // Average episode duration for series
        director: 'Hwang Dong-hyuk',
        cast: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon', 'HoYeon Jung', 'O Yeong-su'],
        rating: 8.0,
        poster_path: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
        backdrop_path: 'https://image.tmdb.org/t/p/w1280/9yxep7oJdkj3Pla9TD9gKflRApY.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=oqxAJKy0ii4',
        language: 'English',
        country: 'South Korea',
        budget: 21400000,
        revenue: 1650000000,
        status: 'Released'
      }
    ];

    // Save all movies
    for (let movieData of movies) {
      const movie = new Movie(movieData);
      await movie.save();
    }

    console.log('🎬 Created 20 sample movies');

    // Add some movies to user favorites for testing
    const savedMovies = await Movie.find().limit(5);
    user1.favorites = [savedMovies[0]._id, savedMovies[1]._id, savedMovies[2]._id];
    user2.favorites = [savedMovies[1]._id, savedMovies[3]._id, savedMovies[4]._id];
    
    await user1.save();
    await user2.save();
    console.log('❤️ Added sample favorites to users');

    console.log('\n🎉 Seed data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log('👤 Admin: username="admin", password="admin123"');
    console.log('👤 User 1: username="testuser1", password="user123"');
    console.log('👤 User 2: username="testuser2", password="user123"');
    console.log('🎬 20 movies with complete information');
    console.log('❤️ Sample favorites added for testing');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

seedData();
