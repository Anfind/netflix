// Quick seed script cho testing UI
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const sampleMoviesData = [
  {
    title: "Avatar: The Way of Water",
    backdrop_path: "https://image.tmdb.org/t/p/original/198vrF8k7mfQ4FjDJsBmdQcaiyq.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    overview: "Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family.",
    release_date: "2022-12-16",
    vote_average: 7.6,
    genres: ["Action", "Adventure", "Science Fiction"],
    video_url: "https://www.youtube.com/embed/_5UjuudSuOo",
    featured: true,
    trending: true
  },
  {
    title: "Top Gun: Maverick",
    backdrop_path: "https://image.tmdb.org/t/p/original/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    overview: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
    release_date: "2022-05-27",
    vote_average: 8.3,
    genres: ["Action", "Drama"],
    video_url: "https://www.youtube.com/embed/qSqVVswa420",
    featured: true,
    trending: true
  },
  {
    title: "Black Panther: Wakanda Forever",
    backdrop_path: "https://image.tmdb.org/t/p/original/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    overview: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death.",
    release_date: "2022-11-11",
    vote_average: 7.3,
    genres: ["Action", "Adventure", "Drama"],
    video_url: "https://www.youtube.com/embed/_Z3QKkl1v94",
    featured: false,
    trending: true
  },
  {
    title: "Dune",
    backdrop_path: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.",
    release_date: "2021-10-22",
    vote_average: 8.0,
    genres: ["Adventure", "Drama", "Science Fiction"],
    video_url: "https://www.youtube.com/embed/8g18jFHCLXk",
    featured: true,
    trending: false
  },
  {
    title: "Doctor Strange in the Multiverse of Madness",
    backdrop_path: "https://image.tmdb.org/t/p/original/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
    overview: "Doctor Strange, with the help of mystical allies both old and new, traverses the mind-bending and dangerous alternate realities of the Multiverse.",
    release_date: "2022-05-06",
    vote_average: 7.3,
    genres: ["Action", "Adventure", "Horror"],
    video_url: "https://www.youtube.com/embed/aWzlQ2N6qqg",
    featured: false,
    trending: true
  },
  {
    title: "The Batman",
    backdrop_path: "https://image.tmdb.org/t/p/original/b0PlHKp3h5L1KJ6sjKQm1lT5bbm.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    release_date: "2022-03-04",
    vote_average: 7.8,
    genres: ["Action", "Crime", "Drama"],
    video_url: "https://www.youtube.com/embed/mqqft2x_Aa4",
    featured: true,
    trending: false
  },
  {
    title: "Minions: The Rise of Gru",
    backdrop_path: "https://image.tmdb.org/t/p/original/uoqhuWYnDMPKPn0ezxwgFI8qkb1.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg",
    overview: "A fanboy of a supervillain supergroup known as the Vicious 6, Gru hatches a plan to become evil enough to join them, with the backup of his followers, the Minions.",
    release_date: "2022-07-01",
    vote_average: 7.3,
    genres: ["Animation", "Adventure", "Comedy"],
    video_url: "https://www.youtube.com/embed/6DxjJzmYsXo",
    featured: false,
    trending: false
  },
  {
    title: "Stranger Things 4",
    backdrop_path: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    overview: "It's been six months since the Battle of Starcourt, which brought terror and destruction to Hawkins. Struggling with the aftermath, our group of friends are separated.",
    release_date: "2022-05-27",
    vote_average: 8.7,
    genres: ["Drama", "Fantasy", "Horror"],
    video_url: "https://www.youtube.com/embed/yQEondeGvKo",
    featured: true,
    trending: true
  }
];

async function quickSeed() {
  console.log('🚀 Bắt đầu seed phim mẫu...');
  
  try {
    // First register an admin
    await axios.post(`${BASE_URL}/users/register`, {
      userName: 'admin',
      email: 'admin@netflix.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Login to get admin token
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@netflix.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.data.apiKey;
    console.log('✅ Admin đăng nhập thành công');

    // Add movies
    for (let i = 0; i < sampleMoviesData.length; i++) {
      try {
        await axios.post(`${BASE_URL}/movies`, sampleMoviesData[i], {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Đã thêm phim: ${sampleMoviesData[i].title}`);
      } catch (error) {
        console.log(`⚠️ Lỗi thêm phim ${sampleMoviesData[i].title}:`, error.response?.data?.message);
      }
    }
    
    console.log(`🎬 Hoàn thành! Đã seed ${sampleMoviesData.length} phim`);
    
  } catch (error) {
    console.error('❌ Lỗi seed:', error.response?.data || error.message);
  }
}

quickSeed();
