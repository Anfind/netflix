import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look for .env in parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import Movie from '../models/movies.model.js';

const updateVideoUrls = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌍 Connected to MongoDB Atlas');

    // Get all movies
    const movies = await Movie.find({});
    console.log(`📋 Found ${movies.length} movies to update`);

    let updatedCount = 0;

    for (let movie of movies) {
      if (movie.trailer_url && !movie.video_url) {
        // Convert YouTube watch URL to embed URL
        let embedUrl = movie.trailer_url;
        
        // Convert youtube.com/watch?v= to youtube.com/embed/
        if (embedUrl.includes('youtube.com/watch?v=')) {
          const videoId = embedUrl.split('v=')[1].split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // Convert youtu.be/ to youtube.com/embed/
        else if (embedUrl.includes('youtu.be/')) {
          const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        // Update the movie
        await Movie.findByIdAndUpdate(movie._id, {
          video_url: embedUrl
        });

        console.log(`✅ Updated ${movie.title}: ${embedUrl}`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} movies with video URLs`);

  } catch (error) {
    console.error('❌ Error updating video URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

updateVideoUrls();
