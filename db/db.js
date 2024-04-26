// db/db.js
const mongoose = require('mongoose');

// Define the MongoDB connection URI
const dbURI = 'mongodb+srv://webdevnav:ZFjNPkr9KrmHOZ4T@cluster0.efmxphq.mongodb.net/';

// Connect to the database
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Handle MongoDB connection events
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

module.exports = db;