import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from '../models/users.model.js';
import Movie from '../models/movies.model.js';

const checkData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌍 Connected to MongoDB Atlas');

    // Check users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.userName} (${user.role}) - ${user.email}`);
    });

    // Check movies
    const movies = await Movie.find({});
    console.log(`\n🎬 Found ${movies.length} movies:`);
    movies.slice(0, 5).forEach(movie => {
      console.log(`- ${movie.title} (${movie.rating}/10)`);
    });

    if (movies.length > 5) {
      console.log(`... và ${movies.length - 5} phim khác`);
    }

    // Test login với admin account
    console.log('\n🔐 Testing admin account:');
    const admin = await User.findOne({ userName: 'admin' });
    if (admin) {
      console.log(`✅ Admin found: ${admin.userName} - ${admin.email}`);
      console.log(`Password field exists: ${admin.password ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Admin account not found');
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

checkData();
