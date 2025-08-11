import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Models
import UserModel from "../models/users.model.js";
import moviesModel from "../models/movies.model.js";

dotenv.config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }
};

// Sample users data
const sampleUsers = [
    {
        userName: "admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin"
    },
    {
        userName: "testuser",
        email: "user@gmail.com", 
        password: "user123",
        role: "user"
    },
    {
        userName: "johndoe",
        email: "john@gmail.com",
        password: "john123",
        role: "user"
    }
];

// Sample movies data với YouTube trailers thật
const sampleMovies = [
    {
        title: "Interstellar",
        backdrop_path: "https://image.tmdb.org/t/p/original/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        release_date: "2014-11-07",
        vote_average: 8.6,
        video_url: "https://www.youtube.com/embed/zSWdZVtXT7E",
        genres: ["Science Fiction", "Drama", "Adventure"],
        runtime: 169,
        featured: true
    },
    {
        title: "The Matrix",
        backdrop_path: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        release_date: "1999-03-31",
        vote_average: 8.7,
        video_url: "https://www.youtube.com/embed/vKQi3bBA1y8",
        genres: ["Action", "Science Fiction"],
        runtime: 136,
        featured: true
    },
    {
        title: "Inception",
        backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        release_date: "2010-07-16",
        vote_average: 8.8,
        video_url: "https://www.youtube.com/embed/YoHD9XEInc0",
        genres: ["Action", "Science Fiction", "Adventure"],
        runtime: 148,
        featured: true
    },
    {
        title: "Spider-Man: No Way Home",
        backdrop_path: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.",
        release_date: "2021-12-17",
        vote_average: 8.4,
        video_url: "https://www.youtube.com/embed/JfVOs4VSpmA",
        genres: ["Action", "Adventure", "Science Fiction"],
        runtime: 148,
        featured: false
    },
    {
        title: "Avengers: Endgame",
        backdrop_path: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos.",
        release_date: "2019-04-26",
        vote_average: 8.3,
        video_url: "https://www.youtube.com/embed/TcMBFSGVi1c",
        genres: ["Adventure", "Science Fiction", "Action"],
        runtime: 181,
        featured: true
    },
    {
        title: "Avatar",
        backdrop_path: "https://image.tmdb.org/t/p/original/Yc9q6684UgYhGjhrXRhI4Vni2AW.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
        overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission.",
        release_date: "2009-12-18",
        vote_average: 7.6,
        video_url: "https://www.youtube.com/embed/5PSNL1qE6VY",
        genres: ["Action", "Adventure", "Fantasy", "Science Fiction"],
        runtime: 162,
        featured: false
    },
    {
        title: "Frozen",
        backdrop_path: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/kgwjIb2JDHRhNk13lmSxEKgBFGU.jpg",
        overview: "Young princess Anna of Arendelle dreams about finding true love at her sister Elsa's coronation.",
        release_date: "2013-11-27",
        vote_average: 7.3,
        video_url: "https://www.youtube.com/embed/TbQm5doF_Uc",
        genres: ["Animation", "Family", "Adventure"],
        runtime: 102,
        featured: false
    },
    {
        title: "Top Gun: Maverick",
        backdrop_path: "https://image.tmdb.org/t/p/original/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        overview: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
        release_date: "2022-05-27",
        vote_average: 8.3,
        video_url: "https://www.youtube.com/embed/qSqVVswa420",
        genres: ["Action", "Drama"],
        runtime: 131,
        featured: true
    },
    {
        title: "Dune",
        backdrop_path: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrDbm9kBAs6xKvL.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.",
        release_date: "2021-10-22",
        vote_average: 8.0,
        video_url: "https://www.youtube.com/embed/8g18jFHCLXk",
        genres: ["Science Fiction", "Adventure"],
        runtime: 155,
        featured: false
    },
    {
        title: "John Wick",
        backdrop_path: "https://image.tmdb.org/t/p/original/umC04Cozevu8nn3JTDJ1pc7PVTn.jpg",
        poster_path: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
        overview: "Ex-hitman John Wick comes out of retirement to track down the gangsters that took everything from him.",
        release_date: "2014-10-24",
        vote_average: 7.4,
        video_url: "https://www.youtube.com/embed/C0BMx-qxsP4",
        genres: ["Action", "Thriller"],
        runtime: 101,
        featured: false
    }
];

// Seed functions
const seedUsers = async () => {
    try {
        // Xóa users cũ
        await UserModel.deleteMany({});
        console.log('🗑️ Đã xóa users cũ');

        // Tạo users mới
        const users = [];
        for (const userData of sampleUsers) {
            const hashedPassword = bcrypt.hashSync(userData.password, 12);
            users.push({
                ...userData,
                password: hashedPassword
            });
        }

        const createdUsers = await UserModel.insertMany(users);
        console.log(`✅ Đã tạo ${createdUsers.length} users mẫu`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Lỗi khi seed users:', error);
    }
};

const seedMovies = async (adminUser) => {
    try {
        // Xóa movies cũ
        await moviesModel.deleteMany({});
        console.log('🗑️ Đã xóa movies cũ');

        // Thêm createdBy cho movies
        const moviesWithCreator = sampleMovies.map(movie => ({
            ...movie,
            createdBy: adminUser._id,
            view_count: Math.floor(Math.random() * 10000),
            favorite_count: Math.floor(Math.random() * 1000)
        }));

        const createdMovies = await moviesModel.insertMany(moviesWithCreator);
        console.log(`✅ Đã tạo ${createdMovies.length} movies mẫu`);
        return createdMovies;
    } catch (error) {
        console.error('❌ Lỗi khi seed movies:', error);
    }
};

const addSampleFavorites = async (users, movies) => {
    try {
        // Thêm favorites ngẫu nhiên cho user thường
        const regularUsers = users.filter(user => user.role === 'user');
        
        for (const user of regularUsers) {
            // Random 3-5 phim yêu thích
            const favoriteCount = Math.floor(Math.random() * 3) + 3;
            const shuffledMovies = movies.sort(() => 0.5 - Math.random());
            const favoriteMovies = shuffledMovies.slice(0, favoriteCount);

            user.favorites = favoriteMovies.map(movie => ({
                movieId: movie._id,
                addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random trong 30 ngày qua
            }));

            // Random watch history
            const historyCount = Math.floor(Math.random() * 8) + 5;
            const historyMovies = movies.sort(() => 0.5 - Math.random()).slice(0, historyCount);
            
            user.watchHistory = historyMovies.map(movie => ({
                movieId: movie._id,
                watchedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random trong 60 ngày qua
                watchDuration: Math.floor(Math.random() * movie.runtime * 60) // Random duration
            }));

            await user.save();
        }

        console.log('✅ Đã thêm favorites và watch history mẫu');
    } catch (error) {
        console.error('❌ Lỗi khi thêm favorites:', error);
    }
};

// Main seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Bắt đầu seed database...');
        
        // Kết nối database
        await connectDB();

        // Seed users
        const users = await seedUsers();
        const adminUser = users.find(user => user.role === 'admin');

        // Seed movies
        const movies = await seedMovies(adminUser);

        // Thêm sample favorites và watch history
        await addSampleFavorites(users, movies);

        console.log('🎉 Seed database hoàn thành!');
        console.log('\n📋 Thông tin đăng nhập:');
        console.log('👤 Admin: admin@gmail.com / admin123');
        console.log('👤 User: user@gmail.com / user123');
        console.log('👤 User 2: john@gmail.com / john123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi seed database:', error);
        process.exit(1);
    }
};

// Chạy seed
seedDatabase();
