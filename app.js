// external packages
const express = require('express');
const mongoose = require('mongoose');
const { resolve } = require('path');
const cors = require('cors');
// loads environment variables
require('dotenv').config();

// local packages
const globalErrorHandler = require('./controllers/errorHandlers/global');
const unExistingRouteHandler = require('./controllers/errorHandlers/unroutable');

// Route modules
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

// constants
const PORT = process.env.PORT || 80;
const DB_URL = process.env.DB_URL || 'mongodb://localhost/blog';

// Initialize application
const app = express();

// Connect to Database
(async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Successfully Connected to Database!');
  } catch (error) {
    console.log('Connection to Database Failed!\n', error);
  }
})();

// Implement cors
app.use(cors());

// Set up express middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(resolve(__dirname, 'public')));
app.use(express.static(resolve(__dirname, 'uploads')));
// Set pug as the biew engine
app.set('view engine', 'pug');
// Do not rely on express default view finding inside the views folder
app.set('views', resolve(__dirname, 'views'));

// Handle routes
app.use('/blog/v1/posts', postsRoutes);
app.use('/blog/v1/accounts', usersRoutes);

// Handle all unmatching routes
app.all('*', unExistingRouteHandler);

// Global error handler
app.use(globalErrorHandler);

// Listen on PORT for connections to server
app.listen(PORT, () => {
  console.log(`Server Listening On Port: ${PORT}`);
});

console.clear();
