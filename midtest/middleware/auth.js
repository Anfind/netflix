import UserModel from "../models/users.model.js";

// Middleware kiểm tra authentication
export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.headers['x-api-key'];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token không được cung cấp'
            });
        }

        // Tìm user theo apiKey
        const user = await UserModel.findOne({ apiKey: token, isActive: true });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Gắn user vào request để sử dụng trong controller
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực',
            error: error.message
        });
    }
};

// Middleware kiểm tra role admin
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa xác thực'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền thực hiện hành động này'
        });
    }

    next();
};

// Middleware kiểm tra user hoặc admin
export const requireUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa xác thực'
        });
    }

    if (!['user', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập'
        });
    }

    next();
};

// Middleware optional auth (không bắt buộc đăng nhập)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.headers['x-api-key'];
        
        if (token) {
            const user = await UserModel.findOne({ apiKey: token, isActive: true });
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Nếu có lỗi, vẫn cho phép request tiếp tục
        next();
    }
};
