import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Controllers
import usersController from "./controller/users.controller.js";
import moviesController from "./controller/movies.controller.js";
import adminController from "./controller/admin.controller.js";

// Middleware
import { 
    authenticateUser, 
    requireAdmin, 
    requireUser, 
    optionalAuth 
} from "./middleware/auth.js";
import { 
    validateUserRegistration, 
    validateUserLogin, 
    validateMovie, 
    validateObjectId 
} from "./middleware/validation.js";

dotenv.config();

// Database connection
const getMongoUri = process.env.MONGO_URI;
if (!getMongoUri) {
    console.error('MONGO_URI không được cung cấp trong file .env');
    process.exit(1);
}

try {
    await mongoose.connect(getMongoUri);
    console.log('✅ Kết nối MongoDB thành công');
} catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
}

const app = express();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ================================
// AUTH ROUTES (Public)
// ================================
app.post("/users/register", validateUserRegistration, usersController.registerNewUsers);
app.post("/users/login", validateUserLogin, usersController.login);

// ================================
// USER ROUTES (Protected)
// ================================
app.post("/users/logout", authenticateUser, usersController.logout);
app.get("/users/profile", authenticateUser, usersController.getProfile);
app.put("/users/profile", authenticateUser, usersController.updateProfile);

// Favorites
app.post("/users/favorites/:movieId", 
    authenticateUser, 
    requireUser, 
    validateObjectId('movieId'), 
    usersController.addToFavorites
);
app.delete("/users/favorites/:movieId", 
    authenticateUser, 
    requireUser, 
    validateObjectId('movieId'), 
    usersController.removeFromFavorites
);
app.get("/users/favorites", authenticateUser, requireUser, usersController.getFavorites);

// Watch History
app.post("/users/watch-history/:movieId", 
    authenticateUser, 
    requireUser, 
    validateObjectId('movieId'), 
    usersController.addToWatchHistory
);
app.get("/users/watch-history", authenticateUser, requireUser, usersController.getWatchHistory);

// ================================
// MOVIES ROUTES (Public + Protected)
// ================================
// Public routes
app.get("/movies", optionalAuth, moviesController.getAllMovies);
app.get("/movies/featured", moviesController.getFeaturedMovies);
app.get("/movies/trending", moviesController.getTrendingMovies);
app.get("/movies/genre/:genre", moviesController.getMoviesByGenre);
app.get("/movies/:moviesId", 
    optionalAuth, 
    validateObjectId('moviesId'), 
    moviesController.getMoviesById
);

// Admin only routes
app.post("/movies", 
    authenticateUser, 
    requireAdmin, 
    validateMovie, 
    moviesController.createNewMovies
);
app.put("/movies/:moviesId", 
    authenticateUser, 
    requireAdmin, 
    validateObjectId('moviesId'), 
    validateMovie, 
    moviesController.updateMovie
);
app.delete("/movies/:moviesId", 
    authenticateUser, 
    requireAdmin, 
    validateObjectId('moviesId'), 
    moviesController.deleteMovie
);

// ================================
// ADMIN ROUTES (Admin Only)
// ================================
app.get("/admin/dashboard", authenticateUser, requireAdmin, adminController.getDashboardStats);
app.get("/admin/users", authenticateUser, requireAdmin, adminController.getAllUsers);
app.get("/admin/users/:userId", 
    authenticateUser, 
    requireAdmin, 
    validateObjectId('userId'), 
    adminController.getUserById
);

// ================================
// LEGACY ROUTES (Backward compatibility)
// ================================
app.post("/movies/new", moviesController.createNewMovies);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống',
        error: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route không tồn tại',
        requestedUrl: req.originalUrl
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/health`);
});

export default app;