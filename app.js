const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const db = require('./db/db'); // Require the database connection file
const session = require('client-sessions');
const setTimeZone = require('./helpers/timezone');
const app = express();

 
// Use the setTimeZone middleware for all routes
app.use(setTimeZone);

app.use(session({
  cookieName: 'session',
  secret: 'asdsdbjkasbdbakjdjb',
  duration: 30 * 60 * 1000,
  activeDuration: 60 * 60 * 1000,
  httpOnly: true,
  keysToPreserve: ['susername', 'userType'],
}));

// Set SESSIONS in res.locals
app.use((req, res, next) => {
  res.locals.susername = req.session.susername;
  res.locals.userType = req.session.userType;
  next();
});



// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Use the routes  
app.use('/', routes); 
 
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

 
const port = process.env.PORT || 4000;
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
 