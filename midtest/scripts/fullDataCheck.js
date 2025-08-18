import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from '../models/users.model.js';
import Movie from '../models/movies.model.js';

const checkFullData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌍 Connected to MongoDB Atlas');

    // Check all users with full details
    const users = await User.find({});
    console.log(`\n👥 USERS (${users.length} total):`);
    console.log('=====================================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user._id}`);
      console.log(`   Username: ${user.userName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Full Name: ${user.fullName || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Date of Birth: ${user.dateOfBirth || 'N/A'}`);
      console.log(`   Favorites: ${user.favorites?.length || 0} movies`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   API Key: ${user.apiKey ? 'Set' : 'Not set'}`);
      console.log(`   Password Hash: ${user.password ? 'Set' : 'Not set'}`);
      console.log('   ---');
    });

    // Check all movies with full details
    const movies = await Movie.find({});
    console.log(`\n🎬 MOVIES (${movies.length} total):`);
    console.log('=====================================');
    movies.forEach((movie, index) => {
      console.log(`${index + 1}. Movie ID: ${movie._id}`);
      console.log(`   Title: ${movie.title}`);
      console.log(`   Rating: ${movie.rating}/10`);
      console.log(`   Duration: ${movie.duration} min`);
      console.log(`   Director: ${movie.director}`);
      console.log(`   Genres: ${movie.genre?.join(', ') || 'N/A'}`);
      console.log(`   Release Date: ${movie.releaseDate}`);
      console.log(`   Language: ${movie.language}`);
      console.log(`   Country: ${movie.country}`);
      console.log(`   Budget: $${movie.budget?.toLocaleString() || 'N/A'}`);
      console.log(`   Revenue: $${movie.revenue?.toLocaleString() || 'N/A'}`);
      console.log(`   Status: ${movie.status}`);
      console.log(`   View Count: ${movie.view_count || 0}`);
      console.log(`   Favorite Count: ${movie.favorite_count || 0}`);
      console.log(`   Active: ${movie.isActive}`);
      console.log(`   Featured: ${movie.featured}`);
      console.log(`   Created: ${movie.createdAt}`);
      console.log('   ---');
    });

    // Check database statistics
    console.log(`\n📊 DATABASE STATISTICS:`);
    console.log('=====================================');
    console.log(`Total Users: ${users.length}`);
    console.log(`- Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`- Regular Users: ${users.filter(u => u.role === 'user').length}`);
    console.log(`Total Movies: ${movies.length}`);
    console.log(`- Active Movies: ${movies.filter(m => m.isActive).length}`);
    console.log(`- Featured Movies: ${movies.filter(m => m.featured).length}`);

    // Check favorites relationship
    console.log(`\n❤️ FAVORITES RELATIONSHIP:`);
    console.log('=====================================');
    for (const user of users) {
      if (user.favorites && user.favorites.length > 0) {
        console.log(`${user.userName} has ${user.favorites.length} favorites:`);
        const favoriteMovies = await Movie.find({ _id: { $in: user.favorites } });
        favoriteMovies.forEach(movie => {
          console.log(`  - ${movie.title}`);
        });
      } else {
        console.log(`${user.userName} has no favorites`);
      }
    }

    // Test login credentials
    console.log(`\n🔐 LOGIN TEST:`);
    console.log('=====================================');
    console.log('Test accounts:');
    console.log('1. Admin: admin@netflix.com / admin123');
    console.log('2. User 1: user1@gmail.com / user123');
    console.log('3. User 2: user2@gmail.com / user123');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
};

checkFullData();
