import mongoose from "mongoose";

const moviesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
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
        trim: true,
        maxlength: 1000
    },
    release_date: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: 'Release date phải có format YYYY-MM-DD'
        }
    },
    releaseDate: {
        type: Date,
        required: true
    },
    vote_average: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0
    },
    video_url: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty
                return /^https:\/\/(www\.)?(youtube\.com\/embed\/|youtu\.be\/)[\w-]+/.test(v);
            },
            message: 'Video URL phải là YouTube embed link'
        }
    },
    trailer_url: {
        type: String,
        trim: true
    },
    // Genre information
    genre: [{
        type: String,
        enum: ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 
               'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 
               'Sci-Fi', 'Science Fiction', 'Thriller', 'War', 'Western']
    }],
    genres: [{
        type: String,
        enum: ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 
               'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 
               'Sci-Fi', 'Science Fiction', 'Thriller', 'War', 'Western']
    }],
    // Duration and production info
    duration: {
        type: Number, // minutes
        min: 1,
        max: 500
    },
    runtime: {
        type: Number, // minutes
        min: 1,
        max: 500
    },
    director: {
        type: String,
        trim: true,
        maxlength: 200
    },
    cast: [{
        type: String,
        maxlength: 100
    }],
    language: {
        type: String,
        default: 'English',
        maxlength: 50
    },
    country: {
        type: String,
        default: 'USA',
        maxlength: 100
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
    status: {
        type: String,
        enum: ['Released', 'In Production', 'Post Production', 'Planned', 'Cancelled'],
        default: 'Released'
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
moviesSchema.index({ title: 1 });
moviesSchema.index({ genre: 1 });
moviesSchema.index({ genres: 1 });
moviesSchema.index({ vote_average: -1 });
moviesSchema.index({ rating: -1 });
moviesSchema.index({ releaseDate: -1 });
moviesSchema.index({ view_count: -1 });
moviesSchema.index({ featured: 1, rating: -1 });

// Virtual để format release year
moviesSchema.virtual('release_year').get(function() {
    return this.releaseDate ? this.releaseDate.getFullYear() : null;
});

const moviesModel = mongoose.model("Movies", moviesSchema);
export default moviesModel;