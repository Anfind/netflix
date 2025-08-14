import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    username: { 
        type: String, 
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    apiKey: {
        type: String,
        default: ''
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20
    },
    dateOfBirth: {
        type: Date
    },
    // User favorites và watch history
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movies'
    }],
    watchHistory: [{
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movies'
        },
        watchedAt: {
            type: Date,
            default: Date.now
        },
        watchDuration: {
            type: Number, // seconds
            default: 0
        }
    }],
    profile: {
        avatar: {
            type: String,
            default: ''
        },
        dateOfBirth: Date,
        phone: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.index({ role: 1 });
userSchema.index({ favorites: 1 });
userSchema.index({ 'watchHistory.movieId': 1 });

// Hash password trước khi save
userSchema.pre('save', async function(next) {
    // Chỉ hash nếu password được modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

const UserModel = mongoose.model("users", userSchema);
export default UserModel;