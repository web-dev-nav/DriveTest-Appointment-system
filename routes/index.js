// routes/index.js
const express = require('express');
const dataController = require('../controllers/dataController');
const router = express.Router();
const { requireDriver, requireAdmin, requireExaminer } = require('../Middleware/checkaccess'); // Import the middleware
const { generateTimeSlots } = require('../helpers/dateHelper'); 
const UserData = require('../models/userDataModel');
const Appointment = require('../models/appointDataModel');

// Define routes
router.get('/', (req, res) => {
  
  
  const data = {
    title: 'Dashboard',
    desc: 'DriveTest Booking Kiosk',
  };
  res.render('dashboard', data);
});

router.get('/login', (req, res) => {
  const data = {
    title: 'Login',
    desc: 'Login or Create an account',

  };
  res.render('login', data);


});

router.get('/g2', requireDriver, async(req, res) => {
  try {
     // Retrieve the user identifier from the session
     const susername = req.session.susername;
     const user = await UserData.findOne({ susername }); // Assuming you store user ID in the session

    if (user) {
      const data = {
        title: 'G2 Test',
        desc: 'G2 Driving Test Form',
        g2Data: user, // Pass the G2 data to the view
      };

      res.render('g2_page', data);
    } else {
      // Handle the case when the user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).send('Internal Server Error');
  }
});

router.get('/g', requireDriver, async (req, res) => {
  try {
    // Retrieve the user identifier from the session
    const susername = req.session.susername;

    // Fetch user data from the database using the identifier
    const user = await UserData.findOne({ susername });

      // Call the function to fetch appointments
      const appointments = await dataController.findAppointmentsByUsername(req, res);

    if (user) {
      const result = await dataController.findFieldsWithDefaultValues(susername); // Call the function to get the result

      // Render the 'g_page' template with the user data
      res.render('g_page', { user, result, appointments});
    } else {
      // Handle the case when user data is not found
      const data = {
        title: 'G Test',
        desc: 'G Driving Test Form',
      };
      res.render('g_page', data);
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Error fetching user data from the database');
  }
});

// Separate route for fetching existing appointments
router.get('/existing-appointments', async (req, res) => {
  try {
    const selectedDate = req.query.date;
    const existingAppointments = await Appointment.findOne({ date: selectedDate });

    if (!existingAppointments) {
      return res.json([]); // Return an empty array if no existing appointments
    }

    const timeSlots = existingAppointments.time.map((timeSlot) => ({
      value: timeSlot.value,
      isAvailable: timeSlot.isAvailable,
      isbooked: timeSlot.isbooked,
    }));

    res.json(timeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/appointment', requireAdmin, async(req, res) => {
  try {
    // Retrieve the user identifier from the session
    const susername = req.session.susername;
    const user = await UserData.findOne({ susername }); // Assuming you store user ID in the session

    if (user) {
      const data = {
        title: 'Appointment',
        desc: 'APPOINTMENT AREA',
        timeSlots: generateTimeSlots('09:00', '14:00', 30), // Include timeSlots in the data object 
      };

      res.render('appointment', data);
    } else {
      // Handle the case when the user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/status', requireAdmin, async(req, res) => {
  try {
    // Retrieve the user identifier from the session
    const susername = req.session.susername;
    const user = await UserData.findOne({ susername }); // Assuming you store user ID in the session
    const AppointList = await dataController.getAppointmentsWithUserDetails();
    console.log('Appointments:', AppointList);
    if (user) {
      const data = {
        title: 'STATUS',
        desc: 'STATUS AREA',
        AppointList: AppointList, // Include timeSlots in the data object 
      };

      res.render('status', data);
    } else {
      // Handle the case when the user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/examiner', requireExaminer, async(req, res) => {
  try {
    // Retrieve the user identifier from the session
    const susername = req.session.susername;
    const user = await UserData.findOne({ susername }); // Assuming you store user ID in the session
    const AppointList = await dataController.getAppointmentsWithUserDetails();
    console.log('Appointments:', AppointList);
    if (user) {
      const data = {
        title: 'Examiner',
        desc: 'Examiner Area',
        AppointList: AppointList, // Include timeSlots in the data object 
      };

      res.render('examiner', data);
    } else {
      // Handle the case when the user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/logout', (req, res) => {
// Set the keys to null
  delete req.session.susername;
  delete req.session.userType;
  // Now you can redirect or perform other actions
  res.redirect('/login');

});
 
router.get('/logout', (req, res) => {
  try {
    // Set the keys to null or use delete
    delete req.session.susername;
    delete req.session.userType;

    // Now you can redirect or perform other actions
    res.redirect('/login');
  } catch (error) {
    // Handle the error
    console.error('Error during logout:', error);

    // Optionally, you can render an error page or send a JSON response
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Handle the POST request to save data to the database 
router.post('/signup', dataController.savesignup);
router.post('/auth', dataController.authentication);
router.post('/saveformdata', dataController.saveFormData);
router.post('/fetchuserdata', dataController.fetchFormData);
router.post('/updatecarinfo', dataController.updatecarinfo);
router.post('/appointmentsave', dataController.appointmentsave);
router.post('/updateDriverstatus', dataController.updateDriverstatus);
module.exports = router;  