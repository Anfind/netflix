import UserModel from "../models/users.model.js";
import moviesModel from "../models/movies.model.js";
import bcrypt from "bcryptjs";

const usersController = {
    // Đăng ký user mới
    registerNewUsers: async (req, res) => {
        try {
            const { userName, email, password, role = 'user' } = req.body;
            
            // Kiểm tra user đã tồn tại
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
            const hashedPassword = bcrypt.hashSync(password, 12);
            
            // Tạo user mới
            const createdUser = await UserModel.create({
                userName: userName.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role
            });

            // Remove password from response
            const userResponse = {
                id: createdUser._id,
                userName: createdUser.userName,
                email: createdUser.email,
                role: createdUser.role,
                createdAt: createdUser.createdAt
            };

            res.status(201).json({
                success: true,
                message: "Đăng ký thành công",
                data: userResponse
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi đăng ký",
                error: error.message
            }); 
        }
    },

    // Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Tìm user theo email
            const user = await UserModel.findOne({ 
                email: email.toLowerCase().trim(),
                isActive: true 
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Kiểm tra password
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Tạo apiKey mới
            const randomString = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            const apiKey = `mern-${user._id}-${Date.now()}-${randomString}`;
            
            // Cập nhật apiKey
            user.apiKey = apiKey;
            await user.save();

            // Response
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    id: user._id,
                    userName: user.userName,
                    email: user.email,
                    role: user.role,
                    apiKey
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi đăng nhập",
                error: error.message
            });
        }
    },

    // Verify token
    verifyToken: async (req, res) => {
        try {
            const user = req.user;
            
            res.status(200).json({
                success: true,
                message: 'Token hợp lệ',
                data: {
                    id: user._id,
                    userName: user.userName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                }
            });
        } catch (error) {
            console.error('Verify token error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xác thực token",
                error: error.message
            });
        }
    },

    // Logout
    logout: async (req, res) => {
        try {
            const user = req.user;
            user.apiKey = '';
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi đăng xuất",
                error: error.message
            });
        }
    },

    // Lấy thông tin profile
    getProfile: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id)
                .populate('favorites.movieId', 'title poster_path vote_average')
                .populate('watchHistory.movieId', 'title poster_path')
                .select('-password -apiKey');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thông tin profile",
                error: error.message
            });
        }
    },

    // Cập nhật profile
    updateProfile: async (req, res) => {
        try {
            const { userName, phone, dateOfBirth, avatar } = req.body;
            const user = req.user;

            // Kiểm tra userName trùng lặp (nếu thay đổi)
            if (userName && userName !== user.userName) {
                const existingUser = await UserModel.findOne({ 
                    userName: userName.trim(),
                    _id: { $ne: user._id }
                });
                
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên người dùng đã được sử dụng'
                    });
                }
            }

            // Cập nhật thông tin
            const updateData = {};
            if (userName) updateData.userName = userName.trim();
            if (phone) updateData['profile.phone'] = phone;
            if (dateOfBirth) updateData['profile.dateOfBirth'] = dateOfBirth;
            if (avatar) updateData['profile.avatar'] = avatar;

            const updatedUser = await UserModel.findByIdAndUpdate(
                user._id,
                updateData,
                { new: true }
            ).select('-password -apiKey');

            res.status(200).json({
                success: true,
                message: 'Cập nhật profile thành công',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi cập nhật profile",
                error: error.message
            });
        }
    },

    // Thêm phim vào danh sách yêu thích
    addToFavorites: async (req, res) => {
        try {
            const { movieId } = req.params;
            const user = req.user;

            // Kiểm tra phim có tồn tại
            const movie = await moviesModel.findById(movieId);
            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            // Kiểm tra đã yêu thích chưa
            const alreadyFavorited = user.favorites.some(
                favId => favId.toString() === movieId
            );

            if (alreadyFavorited) {
                return res.status(400).json({
                    success: false,
                    message: 'Phim đã có trong danh sách yêu thích'
                });
            }

            // Thêm vào favorites (chỉ lưu ObjectId)
            user.favorites.push(movieId);
            await user.save();

            // Cập nhật favorite_count của phim
            await moviesModel.findByIdAndUpdate(movieId, {
                $inc: { favorite_count: 1 }
            });

            res.status(200).json({
                success: true,
                message: 'Đã thêm vào danh sách yêu thích',
                data: { movieId, addedAt: new Date() }
            });
        } catch (error) {
            console.error('Add to favorites error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm vào yêu thích",
                error: error.message
            });
        }
    },

    // Xóa phim khỏi danh sách yêu thích
    removeFromFavorites: async (req, res) => {
        try {
            const { movieId } = req.params;
            const user = req.user;

            // Xóa khỏi favorites
            const initialLength = user.favorites.length;
            user.favorites = user.favorites.filter(
                favId => favId.toString() !== movieId
            );

            if (user.favorites.length === initialLength) {
                return res.status(400).json({
                    success: false,
                    message: 'Phim không có trong danh sách yêu thích'
                });
            }

            await user.save();

            // Giảm favorite_count của phim
            await moviesModel.findByIdAndUpdate(movieId, {
                $inc: { favorite_count: -1 }
            });

            res.status(200).json({
                success: true,
                message: 'Đã xóa khỏi danh sách yêu thích'
            });
        } catch (error) {
            console.error('Remove from favorites error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xóa khỏi yêu thích",
                error: error.message
            });
        }
    },

    // Lấy danh sách phim yêu thích
    getFavorites: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id)
                .populate('favorites', 'title poster_path backdrop_path vote_average release_date genres overview');

            const favorites = user.favorites || [];

            res.status(200).json({
                success: true,
                data: favorites
            });
        } catch (error) {
            console.error('Get favorites error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách yêu thích",
                error: error.message
            });
        }
    },

    // Thêm vào lịch sử xem
    addToWatchHistory: async (req, res) => {
        try {
            const { movieId } = req.params;
            const { watchDuration = 0 } = req.body;
            const user = req.user;

            // Kiểm tra phim có tồn tại
            const movie = await moviesModel.findById(movieId);
            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phim'
                });
            }

            // Xóa lịch sử cũ của phim này (nếu có)
            user.watchHistory = user.watchHistory.filter(
                history => history.movieId.toString() !== movieId
            );

            // Thêm lịch sử mới
            user.watchHistory.unshift({ 
                movieId, 
                watchDuration: Math.max(0, watchDuration),
                watchedAt: new Date()
            });

            // Giới hạn lịch sử tối đa 100 phim
            if (user.watchHistory.length > 100) {
                user.watchHistory = user.watchHistory.slice(0, 100);
            }

            await user.save();

            // Cập nhật view_count của phim
            await moviesModel.findByIdAndUpdate(movieId, {
                $inc: { view_count: 1 }
            });

            res.status(200).json({
                success: true,
                message: 'Đã thêm vào lịch sử xem',
                data: { movieId, watchDuration, watchedAt: new Date() }
            });
        } catch (error) {
            console.error('Add to watch history error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm vào lịch sử xem",
                error: error.message
            });
        }
    },

    // Lấy lịch sử xem
    getWatchHistory: async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const user = await UserModel.findById(req.user._id)
                .populate({
                    path: 'watchHistory.movieId',
                    select: 'title poster_path backdrop_path vote_average release_date genres overview runtime'
                });

            const watchHistory = user.watchHistory
                .filter(history => history.movieId) // Lọc các phim bị xóa
                .slice(skip, skip + parseInt(limit))
                .map(history => ({
                    ...history.movieId.toObject(),
                    watchedAt: history.watchedAt,
                    watchDuration: history.watchDuration
                }));

            res.status(200).json({
                success: true,
                data: watchHistory,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: user.watchHistory.filter(h => h.movieId).length
                }
            });
        } catch (error) {
            console.error('Get watch history error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy lịch sử xem",
                error: error.message
            });
        }
    }
};

export default usersController;