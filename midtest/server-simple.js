import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Controllers
import usersController from "./controller/users.controller.js";
import moviesController from "./controller/movies.controller.js";

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

// Basic routes
app.post("/users/register", usersController.registerNewUsers);
app.post("/users/login", usersController.login);
app.get("/movies", moviesController.getAllMovies);
app.get("/movies/:moviesId", moviesController.getMoviesById);
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
