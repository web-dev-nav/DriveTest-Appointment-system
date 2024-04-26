const moment = require('moment-timezone');

function setTimeZone(req, res, next) {
  // Set the desired timezone for your application
  const timeZone = 'America/Toronto';
  
  // Set the timezone for the current request
  req.timezone = timeZone;
  
  // Continue to the next middleware
  next();
}

module.exports = setTimeZone;
