// external packages
const express = require('express');
const mongoose = require('mongoose');
const { join } = require('path');
const cors = require('cors');

// local packages
const globalErrorHandler = require('./controllers/errorHandlers/globalErrorHandler');
const unExistingRouteHandler = require('./controllers/errorHandlers/unRoutableError');

// Route modules
const postsRoutes = require('./routes/postsRoutes');
const userRoutes = require('./routes/usersRoutes');
/*================================================*/
// constants
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL || 'mongodb://localhost/blog';

// initialize application
const app = express();

// loads environment variables
require('dotenv').config();

// connect to Database
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(console.log('Successfully Connected to Database !'))
    .catch(error => console.log('Connection to Database Failed !'));

// implement cors
app.use(cors());

// set up express middleware to parse JSON and server static files
app.use(express.json());

app.use(express.static(join(__dirname, 'public')));

app.set('view engine', 'pug');

// Do not rely on express default view finding inside the view folder
app.set('views', join(__dirname, 'public'));

// Handle routes
app.use('/blog/v1/posts', postsRoutes);
app.use('/blog/v1/accounts', userRoutes);

// Handle all unmatching routes
app.all('*', unExistingRouteHandler);

// Global error handler
app.use(globalErrorHandler);

// listen on PORT for connections to server
app.listen(PORT, () => {
    console.log(`Server Listening On Port: ${PORT}`)
});
