import mongoose from "mongoose";

const moviesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    backdrop_path: {
        type: String,
        required: true,
        trim: true
    },
    poster_path: {
        type: String,
        required: true,
        trim: true
    },
    overview: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    release_date: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: 'Release date phải có format YYYY-MM-DD'
        }
    },
    vote_average: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0
    },
    video_url: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^https:\/\/(www\.)?(youtube\.com\/embed\/|youtu\.be\/)[\w-]+/.test(v);
            },
            message: 'Video URL phải là YouTube embed link'
        }
    },
    // Metadata bổ sung
    genres: [{
        type: String,
        enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
               'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 
               'Science Fiction', 'Thriller', 'War', 'Western']
    }],
    runtime: {
        type: Number, // minutes
        min: 1,
        max: 500
    },
    adult: {
        type: Boolean,
        default: false
    },
    original_language: {
        type: String,
        default: 'en',
        maxlength: 5
    },
    budget: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    // Statistics
    view_count: {
        type: Number,
        default: 0
    },
    favorite_count: {
        type: Number,
        default: 0
    },
    // Admin fields
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {
    timestamps: true
});

// Indexes để tối ưu search và filter
moviesSchema.index({ title: 'text', overview: 'text' });
moviesSchema.index({ genres: 1 });
moviesSchema.index({ vote_average: -1 });
moviesSchema.index({ release_date: -1 });
moviesSchema.index({ view_count: -1 });
moviesSchema.index({ featured: 1, vote_average: -1 });

// Virtual để format release year
moviesSchema.virtual('release_year').get(function() {
    return this.release_date ? new Date(this.release_date).getFullYear() : null;
});

const moviesModel = mongoose.model("Movies", moviesSchema);
export default moviesModel;