import moviesModel from "../models/movies.model.js";
import axios from "axios";

// Helper function để lấy video YouTube ngẫu nhiên cho demo
const getRandomYouTubeTrailer = async (movieTitle) => {
    try {
        // Danh sách video trailers mẫu cho demo
        const sampleTrailers = [
            'https://www.youtube.com/embed/zSWdZVtXT7E', // Interstellar
            'https://www.youtube.com/embed/1Roy4o4WyJM', // The Matrix
            'https://www.youtube.com/embed/sAOzrChqmd0', // Inception
            'https://www.youtube.com/embed/QdBZY2fkU-0', // Spider-Man
            'https://www.youtube.com/embed/TcMBFSGVi1c', // Avengers
            'https://www.youtube.com/embed/lV1OOlGwExM', // Avatar
            'https://www.youtube.com/embed/gCcx85zbxz4', // Frozen
            'https://www.youtube.com/embed/nmP2DnfMfNQ', // Top Gun
            'https://www.youtube.com/embed/XW2E2Fnh52w', // Dune
            'https://www.youtube.com/embed/8g18jFHCLXk'  // John Wick
        ];
        
        return sampleTrailers[Math.floor(Math.random() * sampleTrailers.length)];
    } catch (error) {
        // Fallback trailer
        return 'https://www.youtube.com/embed/zSWdZVtXT7E';
    }
};

const moviesController = {
    // Tạo phim mới (Admin only)
    createNewMovies: async (req, res) => {
        try {
            const movieData = req.body;
            
            // Nếu không có video_url, tự động lấy trailer YouTube
            if (!movieData.video_url) {
                movieData.video_url = await getRandomYouTubeTrailer(movieData.title);
            }

            // Thêm thông tin người tạo
            movieData.createdBy = req.user._id;

            const newMovie = await moviesModel.create(movieData);

            res.status(201).json({
                success: true,
                message: 'Tạo phim mới thành công',
                data: newMovie
            });
        } catch (error) {
            console.error('Create movie error:', error);
            res.status(400).json({
                success: false,
                message: 'Lỗi khi tạo phim mới',
                error: error.message
            });
        }
    },

    // Lấy tất cả phim (có filter, search, pagination)
    getAllMovies: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                genre = '',
                sortBy = 'createdAt',
                sortOrder = 'desc',
                featured = '',
                minRating = 0,
                maxRating = 10
            } = req.query;

            // Build query
            const query = { isActive: true };

            // Text search
            if (search) {
                query.$text = { $search: search };
            }

            // Genre filter
            if (genre) {
                query.genres = { $in: [genre] };
            }

            // Featured filter
            if (featured !== '') {
                query.featured = featured === 'true';
            }

            // Rating filter
            query.vote_average = {
                $gte: parseFloat(minRating),
                $lte: parseFloat(maxRating)
            };

            // Build sort
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query
            const skip = (page - 1) * limit;
            const [movies, total] = await Promise.all([
                moviesModel.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .populate('createdBy', 'userName'),
                moviesModel.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: movies,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all movies error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách phim',
                error: error.message
            });
        }
    },

    // Lấy phim theo ID
    getMoviesById: async (req, res) => {
        try {
            const { moviesId } = req.params;
            
            const movie = await moviesModel.findOne({ 
                _id: moviesId, 
                isActive: true 
            }).populate('createdBy', 'userName email');

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            // Nếu user đã đăng nhập, cập nhật view count
            if (req.user) {
                await moviesModel.findByIdAndUpdate(moviesId, {
                    $inc: { view_count: 1 }
                });
            }

            res.status(200).json({
                success: true,
                data: movie
            });
        } catch (error) {
            console.error('Get movie by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin phim',
                error: error.message
            });
        }
    },

    // Cập nhật phim (Admin only)
    updateMovie: async (req, res) => {
        try {
            const { moviesId } = req.params;
            const updateData = req.body;

            // Không cho phép thay đổi một số field nhạy cảm
            delete updateData.createdBy;
            delete updateData.view_count;
            delete updateData.favorite_count;

            const updatedMovie = await moviesModel.findByIdAndUpdate(
                moviesId,
                updateData,
                { new: true, runValidators: true }
            ).populate('createdBy', 'userName');

            if (!updatedMovie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Cập nhật phim thành công',
                data: updatedMovie
            });
        } catch (error) {
            console.error('Update movie error:', error);
            res.status(400).json({
                success: false,
                message: 'Lỗi khi cập nhật phim',
                error: error.message
            });
        }
    },

    // Xóa phim (Admin only) - Soft delete
    deleteMovie: async (req, res) => {
        try {
            const { moviesId } = req.params;

            const movie = await moviesModel.findByIdAndUpdate(
                moviesId,
                { isActive: false },
                { new: true }
            );

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa phim thành công'
            });
        } catch (error) {
            console.error('Delete movie error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa phim',
                error: error.message
            });
        }
    },

    // Lấy phim nổi bật
    getFeaturedMovies: async (req, res) => {
        try {
            const { limit = 10 } = req.query;

            const featuredMovies = await moviesModel.find({
                featured: true,
                isActive: true
            })
            .sort({ vote_average: -1, view_count: -1 })
            .limit(parseInt(limit))
            .populate('createdBy', 'userName');

            res.status(200).json({
                success: true,
                data: featuredMovies
            });
        } catch (error) {
            console.error('Get featured movies error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy phim nổi bật',
                error: error.message
            });
        }
    },

    // Lấy phim trending (xem nhiều nhất)
    getTrendingMovies: async (req, res) => {
        try {
            const { limit = 10, period = 'all' } = req.query;

            // Build query dựa vào thời gian
            const query = { isActive: true };
            
            if (period === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                query.createdAt = { $gte: weekAgo };
            } else if (period === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                query.createdAt = { $gte: monthAgo };
            }

            const trendingMovies = await moviesModel.find(query)
                .sort({ view_count: -1, favorite_count: -1 })
                .limit(parseInt(limit))
                .populate('createdBy', 'userName');

            res.status(200).json({
                success: true,
                data: trendingMovies
            });
        } catch (error) {
            console.error('Get trending movies error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy phim trending',
                error: error.message
            });
        }
    },

    // Lấy phim theo thể loại
    getMoviesByGenre: async (req, res) => {
        try {
            const { genre } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const query = {
                genres: { $in: [genre] },
                isActive: true
            };

            const skip = (page - 1) * limit;
            const [movies, total] = await Promise.all([
                moviesModel.find(query)
                    .sort({ vote_average: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                moviesModel.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: movies,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get movies by genre error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy phim theo thể loại',
                error: error.message
            });
        }
    },

    // Toggle featured status (Admin only)
    toggleFeatured: async (req, res) => {
        try {
            const { moviesId } = req.params;

            const movie = await moviesModel.findById(moviesId);
            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            movie.featured = !movie.featured;
            await movie.save();

            res.status(200).json({
                success: true,
                message: `Phim đã được ${movie.featured ? 'đánh dấu' : 'bỏ đánh dấu'} là nổi bật`,
                data: { featured: movie.featured }
            });
        } catch (error) {
            console.error('Toggle featured error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật trạng thái nổi bật',
                error: error.message
            });
        }
    },

    // Lấy thống kê phim (Admin only)
    getMovieStats: async (req, res) => {
        try {
            const stats = await moviesModel.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalMovies: { $sum: 1 },
                        totalViews: { $sum: '$view_count' },
                        totalFavorites: { $sum: '$favorite_count' },
                        avgRating: { $avg: '$vote_average' },
                        featuredCount: {
                            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Thống kê theo thể loại
            const genreStats = await moviesModel.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$genres' },
                {
                    $group: {
                        _id: '$genres',
                        count: { $sum: 1 },
                        avgRating: { $avg: '$vote_average' },
                        totalViews: { $sum: '$view_count' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    overview: stats[0] || {
                        totalMovies: 0,
                        totalViews: 0,
                        totalFavorites: 0,
                        avgRating: 0,
                        featuredCount: 0
                    },
                    genreStats
                }
            });
        } catch (error) {
            console.error('Get movie stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê phim',
                error: error.message
            });
        }
    }
};

export default moviesController;