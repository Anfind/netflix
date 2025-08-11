// Validation helpers
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    // Ít nhất 6 ký tự, có chữ và số
    return password && password.length >= 6 && /(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
};

export const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/embed\/|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
};

// Middleware validation cho user registration
export const validateUserRegistration = (req, res, next) => {
    const { userName, email, password, role } = req.body;
    const errors = [];

    // Validate userName
    if (!userName || userName.trim().length < 3) {
        errors.push('Tên người dùng phải có ít nhất 3 ký tự');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }

    // Validate password
    if (!password || !validatePassword(password)) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số');
    }

    // Validate role (nếu có)
    if (role && !['user', 'admin'].includes(role)) {
        errors.push('Role chỉ có thể là user hoặc admin');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors
        });
    }

    next();
};

// Middleware validation cho user login
export const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !validateEmail(email)) {
        errors.push('Email không hợp lệ');
    }

    if (!password) {
        errors.push('Mật khẩu không được để trống');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors
        });
    }

    next();
};

// Middleware validation cho movie creation/update
export const validateMovie = (req, res, next) => {
    const { title, backdrop_path, poster_path, overview, release_date, vote_average, video_url, genres, runtime } = req.body;
    const errors = [];

    // Required fields
    if (!title || title.trim().length < 1) {
        errors.push('Tiêu đề phim không được để trống');
    }

    if (!backdrop_path) {
        errors.push('Backdrop path không được để trống');
    }

    if (!poster_path) {
        errors.push('Poster path không được để trống');
    }

    if (!overview || overview.trim().length < 10) {
        errors.push('Mô tả phim phải có ít nhất 10 ký tự');
    }

    // Validate release_date format (YYYY-MM-DD)
    if (!release_date || !/^\d{4}-\d{2}-\d{2}$/.test(release_date)) {
        errors.push('Ngày phát hành phải có định dạng YYYY-MM-DD');
    }

    // Validate vote_average
    if (vote_average !== undefined && (vote_average < 0 || vote_average > 10)) {
        errors.push('Điểm đánh giá phải từ 0 đến 10');
    }

    // Validate video_url
    if (!video_url || !validateYouTubeUrl(video_url)) {
        errors.push('Video URL phải là YouTube embed link hợp lệ');
    }

    // Validate genres (nếu có)
    const validGenres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
                        'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 
                        'Science Fiction', 'Thriller', 'War', 'Western'];
    
    if (genres && Array.isArray(genres)) {
        const invalidGenres = genres.filter(genre => !validGenres.includes(genre));
        if (invalidGenres.length > 0) {
            errors.push(`Thể loại không hợp lệ: ${invalidGenres.join(', ')}`);
        }
    }

    // Validate runtime
    if (runtime !== undefined && (runtime < 1 || runtime > 500)) {
        errors.push('Thời lượng phim phải từ 1 đến 500 phút');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu phim không hợp lệ',
            errors
        });
    }

    next();
};

// Middleware validate MongoDB ObjectId
export const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        
        if (!id || !objectIdRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: `${paramName} không hợp lệ`
            });
        }
        
        next();
    };
};
