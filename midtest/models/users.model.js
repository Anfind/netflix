import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true,
        unique: true,
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
    // User favorites và watch history
    favorites: [{
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movies'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
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

// Index để tối ưu query (bỏ email index vì đã có unique: true)
userSchema.index({ role: 1 });
userSchema.index({ 'favorites.movieId': 1 });
userSchema.index({ 'watchHistory.movieId': 1 });

const UserModel = mongoose.model("users", userSchema);
export default UserModel;