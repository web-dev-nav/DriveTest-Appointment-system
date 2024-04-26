function requireDriver(req, res, next) {
    // Check if userType is "Driver" in the session
    if (req.session.userType === 'Driver') {
      // User is a driver, so allow access
      next();
    } else {
      // User is not a driver, deny access
      res.status(403).send('Access denied. You must be a Driver to access this page. Please login first.');
    }
  } 

  function requireExaminer(req, res, next) {
    // Check if userType is "Driver" in the session
    if (req.session.userType === 'Examiner') {
      // User is a driver, so allow access
      next();
    } else {
      // User is not a driver, deny access
      res.status(403).send('Access denied. You must be a Examiner to access this page. Please login first.');
    }
  } 
  
  function requireAdmin(req, res, next) {
    // Check if userType is "Admin" in the session
    if (req.session.userType === 'Admin') {
      // User is a driver, so allow access
      next(); 
    } else {
      // User is not a driver, deny access
      res.status(403).send('Access denied. You must be a Administrator to access this page. Please login first.');
    }
  }
  module.exports = { requireDriver,requireAdmin,requireExaminer };
    