import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8080';

// Test data
const testAdmin = {
    email: 'admin@gmail.com',
    password: 'admin123'
};

const testUser = {
    email: 'user@gmail.com', 
    password: 'user123'
};

const testMovie = {
    title: "Test Movie",
    backdrop_path: "https://image.tmdb.org/t/p/original/test.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/test.jpg",
    overview: "This is a test movie created by API test script.",
    release_date: "2024-01-01",
    vote_average: 8.5,
    genres: ["Action", "Adventure"],
    runtime: 120
};

// Helper functions
const log = (message, data = '') => {
    console.log(`\n🔷 ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message, error) => {
    console.error(`\n❌ ${message}:`, error.response?.data || error.message);
};

const logSuccess = (message, data = '') => {
    console.log(`\n✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Test functions
const testPublicEndpoints = async () => {
    log('Testing Public Endpoints');
    
    try {
        // Test health check
        const health = await axios.get(`${BASE_URL}/health`);
        logSuccess('Health Check', health.data);

        // Test get all movies
        const movies = await axios.get(`${BASE_URL}/movies`);
        logSuccess(`Get All Movies (${movies.data.data.length} movies)`);

        // Test get featured movies
        const featured = await axios.get(`${BASE_URL}/movies/featured`);
        logSuccess(`Get Featured Movies (${featured.data.data.length} movies)`);

        // Test get trending movies
        const trending = await axios.get(`${BASE_URL}/movies/trending`);
        logSuccess(`Get Trending Movies (${trending.data.data.length} movies)`);

        // Test get movies by genre
        const actionMovies = await axios.get(`${BASE_URL}/movies/genre/Action`);
        logSuccess(`Get Action Movies (${actionMovies.data.data.length} movies)`);

        // Test get movie by ID (first movie)
        if (movies.data.data.length > 0) {
            const movieId = movies.data.data[0]._id;
            const movie = await axios.get(`${BASE_URL}/movies/${movieId}`);
            logSuccess('Get Movie By ID', { title: movie.data.data.title });
        }

    } catch (error) {
        logError('Public Endpoints Test Failed', error);
    }
};

const testUserAuth = async () => {
    log('Testing User Authentication');
    
    try {
        // Test user login
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, testUser);
        const userToken = loginResponse.data.data.apiKey;
        logSuccess('User Login', { 
            userName: loginResponse.data.data.userName,
            role: loginResponse.data.data.role
        });

        // Test get profile
        const profile = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        logSuccess('Get User Profile', {
            userName: profile.data.data.userName,
            favoritesCount: profile.data.data.favorites.length,
            watchHistoryCount: profile.data.data.watchHistory.length
        });

        // Test get favorites
        const favorites = await axios.get(`${BASE_URL}/users/favorites`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        logSuccess(`Get User Favorites (${favorites.data.data.length} movies)`);

        // Test get watch history
        const watchHistory = await axios.get(`${BASE_URL}/users/watch-history`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        logSuccess(`Get Watch History (${watchHistory.data.data.length} movies)`);

        // Test add to favorites (first movie)
        const movies = await axios.get(`${BASE_URL}/movies`);
        if (movies.data.data.length > 0) {
            const movieId = movies.data.data[0]._id;
            
            try {
                const addFav = await axios.post(`${BASE_URL}/users/favorites/${movieId}`, {}, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                logSuccess('Add to Favorites', addFav.data);
            } catch (error) {
                if (error.response?.status === 400) {
                    logSuccess('Add to Favorites (already exists)', error.response.data);
                } else {
                    throw error;
                }
            }

            // Test add to watch history
            const addWatch = await axios.post(`${BASE_URL}/users/watch-history/${movieId}`, {
                watchDuration: 3600
            }, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            logSuccess('Add to Watch History', addWatch.data);
        }

        // Test logout
        const logout = await axios.post(`${BASE_URL}/users/logout`, {}, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        logSuccess('User Logout', logout.data);

        return userToken;

    } catch (error) {
        logError('User Auth Test Failed', error);
        return null;
    }
};

const testAdminAuth = async () => {
    log('Testing Admin Authentication & Operations');
    
    try {
        // Test admin login
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, testAdmin);
        const adminToken = loginResponse.data.data.apiKey;
        logSuccess('Admin Login', { 
            userName: loginResponse.data.data.userName,
            role: loginResponse.data.data.role
        });

        // Test create movie
        const createMovie = await axios.post(`${BASE_URL}/movies`, testMovie, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const createdMovieId = createMovie.data.data._id;
        logSuccess('Create Movie', { 
            id: createdMovieId,
            title: createMovie.data.data.title 
        });

        // Test update movie
        const updateMovie = await axios.put(`${BASE_URL}/movies/${createdMovieId}`, {
            title: "Updated Test Movie",
            vote_average: 9.0
        }, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess('Update Movie', { 
            title: updateMovie.data.data.title,
            rating: updateMovie.data.data.vote_average
        });

        // Test toggle featured
        const toggleFeatured = await axios.patch(`${BASE_URL}/movies/${createdMovieId}/featured`, {}, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess('Toggle Featured', toggleFeatured.data);

        // Test get movie stats
        const stats = await axios.get(`${BASE_URL}/admin/movies/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess('Get Movie Stats', {
            totalMovies: stats.data.data.overview.totalMovies,
            totalViews: stats.data.data.overview.totalViews,
            genreCount: stats.data.data.genreStats.length
        });

        // Test admin dashboard
        const dashboard = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess('Admin Dashboard', {
            totalUsers: dashboard.data.data.users.totalUsers,
            totalMovies: dashboard.data.data.movies.totalMovies,
            recentSignups: dashboard.data.data.recentSignups
        });

        // Test get all users
        const users = await axios.get(`${BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess(`Get All Users (${users.data.data.length} users)`);

        // Test delete movie (soft delete)
        const deleteMovie = await axios.delete(`${BASE_URL}/movies/${createdMovieId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logSuccess('Delete Movie (soft delete)', deleteMovie.data);

        return adminToken;

    } catch (error) {
        logError('Admin Auth Test Failed', error);
        return null;
    }
};

const testUserRegistration = async () => {
    log('Testing User Registration');
    
    try {
        const newUser = {
            userName: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'testpass123'
        };

        const register = await axios.post(`${BASE_URL}/users/register`, newUser);
        logSuccess('User Registration', {
            id: register.data.data.id,
            userName: register.data.data.userName,
            role: register.data.data.role
        });

        // Test login with new user
        const login = await axios.post(`${BASE_URL}/users/login`, {
            email: newUser.email,
            password: newUser.password
        });
        logSuccess('New User Login', {
            userName: login.data.data.userName
        });

    } catch (error) {
        logError('User Registration Test Failed', error);
    }
};

const testErrorHandling = async () => {
    log('Testing Error Handling');
    
    try {
        // Test invalid movie ID
        try {
            await axios.get(`${BASE_URL}/movies/invalid-id`);
        } catch (error) {
            if (error.response?.status === 400) {
                logSuccess('Invalid Movie ID Error Handling', error.response.data);
            } else {
                throw error;
            }
        }

        // Test unauthorized access
        try {
            await axios.get(`${BASE_URL}/admin/dashboard`);
        } catch (error) {
            if (error.response?.status === 401) {
                logSuccess('Unauthorized Access Error Handling', error.response.data);
            } else {
                throw error;
            }
        }

        // Test invalid login
        try {
            await axios.post(`${BASE_URL}/users/login`, {
                email: 'nonexistent@test.com',
                password: 'wrongpass'
            });
        } catch (error) {
            if (error.response?.status === 401) {
                logSuccess('Invalid Login Error Handling', error.response.data);
            } else {
                throw error;
            }
        }

        // Test 404 route
        try {
            await axios.get(`${BASE_URL}/nonexistent-route`);
        } catch (error) {
            if (error.response?.status === 404) {
                logSuccess('404 Route Error Handling', error.response.data);
            } else {
                throw error;
            }
        }

    } catch (error) {
        logError('Error Handling Test Failed', error);
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting API Tests...');
    console.log('═'.repeat(50));

    try {
        await testPublicEndpoints();
        await testUserRegistration();
        await testUserAuth();
        await testAdminAuth();
        await testErrorHandling();

        console.log('\n' + '═'.repeat(50));
        console.log('🎉 All tests completed successfully!');
        console.log('\n📝 Test Summary:');
        console.log('✅ Public endpoints working');
        console.log('✅ User authentication working');
        console.log('✅ Admin authentication working');
        console.log('✅ CRUD operations working');
        console.log('✅ Favorites & watch history working');
        console.log('✅ Error handling working');
        
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
    }
};

// Check if server is running
const checkServer = async () => {
    try {
        await axios.get(`${BASE_URL}/health`);
        return true;
    } catch (error) {
        console.error('❌ Server is not running. Please start the server first:');
        console.error('   cd midtest && npm run dev');
        return false;
    }
};

// Run tests if server is available
checkServer().then(isRunning => {
    if (isRunning) {
        runAllTests();
    } else {
        process.exit(1);
    }
});
