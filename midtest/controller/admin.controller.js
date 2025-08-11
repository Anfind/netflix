import UserModel from "../models/users.model.js";
import moviesModel from "../models/movies.model.js";

const adminController = {
    // Lấy tất cả users (Admin only)
    getAllUsers: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 20, 
                search = '', 
                role = '', 
                isActive = '' 
            } = req.query;

            // Build query
            const query = {};
            
            if (search) {
                query.$or = [
                    { userName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (role) {
                query.role = role;
            }
            
            if (isActive !== '') {
                query.isActive = isActive === 'true';
            }

            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                UserModel.find(query)
                    .select('-password -apiKey')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                UserModel.countDocuments(query)
            ]);

            res.status(200).json({
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách users',
                error: error.message
            });
        }
    },

    // Lấy thông tin user theo ID (Admin only)
    getUserById: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await UserModel.findById(userId)
                .select('-password -apiKey')
                .populate('favorites.movieId', 'title poster_path')
                .populate('watchHistory.movieId', 'title poster_path');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin user',
                error: error.message
            });
        }
    },

    // Cập nhật thông tin user (Admin only)
    updateUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const { userName, email, role, isActive, profile } = req.body;

            // Kiểm tra user tồn tại
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Kiểm tra duplicate userName/email
            if (userName && userName !== user.userName) {
                const existingUser = await UserModel.findOne({ 
                    userName, 
                    _id: { $ne: userId } 
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên người dùng đã được sử dụng'
                    });
                }
            }

            if (email && email !== user.email) {
                const existingUser = await UserModel.findOne({ 
                    email, 
                    _id: { $ne: userId } 
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã được sử dụng'
                    });
                }
            }

            // Cập nhật thông tin
            const updateData = {};
            if (userName) updateData.userName = userName.trim();
            if (email) updateData.email = email.toLowerCase().trim();
            if (role) updateData.role = role;
            if (typeof isActive === 'boolean') updateData.isActive = isActive;
            if (profile) updateData.profile = { ...user.profile, ...profile };

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -apiKey');

            res.status(200).json({
                success: true,
                message: 'Cập nhật user thành công',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(400).json({
                success: false,
                message: 'Lỗi khi cập nhật user',
                error: error.message
            });
        }
    },

    // Xóa user (Admin only) - Soft delete
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;

            // Không cho phép admin tự xóa chính mình
            if (userId === req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa chính mình'
                });
            }

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { isActive: false, apiKey: '' },
                { new: true }
            ).select('-password -apiKey');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa user thành công'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa user',
                error: error.message
            });
        }
    },

    // Tạo user mới (Admin only)
    createUser: async (req, res) => {
        try {
            const { userName, email, password, role = 'user' } = req.body;

            // Kiểm tra duplicate
            const existingUser = await UserModel.findOne({
                $or: [{ email }, { userName }]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.email === email 
                        ? 'Email đã được sử dụng'
                        : 'Tên người dùng đã được sử dụng'
                });
            }

            // Hash password
            const bcrypt = await import('bcryptjs');
            const hashedPassword = bcrypt.hashSync(password, 12);

            // Tạo user
            const newUser = await UserModel.create({
                userName: userName.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role
            });

            const userResponse = {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            };

            res.status(201).json({
                success: true,
                message: 'Tạo user thành công',
                data: userResponse
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(400).json({
                success: false,
                message: 'Lỗi khi tạo user',
                error: error.message
            });
        }
    },

    // Thống kê tổng quan (Admin only)
    getDashboardStats: async (req, res) => {
        try {
            // Thống kê users
            const userStats = await UserModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: { 
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
                        },
                        adminUsers: { 
                            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } 
                        },
                        regularUsers: { 
                            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } 
                        }
                    }
                }
            ]);

            // Thống kê movies
            const movieStats = await moviesModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalMovies: { $sum: 1 },
                        activeMovies: { 
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
                        },
                        featuredMovies: { 
                            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } 
                        },
                        totalViews: { $sum: '$view_count' },
                        totalFavorites: { $sum: '$favorite_count' },
                        avgRating: { $avg: '$vote_average' }
                    }
                }
            ]);

            // Thống kê users đăng ký gần đây (7 ngày)
            const recentSignups = await UserModel.countDocuments({
                createdAt: { 
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                }
            });

            // Top phim xem nhiều nhất
            const topMovies = await moviesModel.find({ isActive: true })
                .sort({ view_count: -1 })
                .limit(5)
                .select('title view_count vote_average');

            res.status(200).json({
                success: true,
                data: {
                    users: userStats[0] || {
                        totalUsers: 0,
                        activeUsers: 0,
                        adminUsers: 0,
                        regularUsers: 0
                    },
                    movies: movieStats[0] || {
                        totalMovies: 0,
                        activeMovies: 0,
                        featuredMovies: 0,
                        totalViews: 0,
                        totalFavorites: 0,
                        avgRating: 0
                    },
                    recentSignups,
                    topMovies
                }
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê',
                error: error.message
            });
        }
    },

    // Reset password user (Admin only)
    resetUserPassword: async (req, res) => {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
                });
            }

            const bcrypt = await import('bcryptjs');
            const hashedPassword = bcrypt.hashSync(newPassword, 12);

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { password: hashedPassword, apiKey: '' },
                { new: true }
            ).select('-password -apiKey');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Reset mật khẩu thành công'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi reset mật khẩu',
                error: error.message
            });
        }
    }
};

export default adminController;
