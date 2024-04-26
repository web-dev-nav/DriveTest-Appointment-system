// controllers/dataController.js
const bcrypt = require('bcrypt');
const UserData = require('../models/userDataModel');
const Appointment = require('../models/appointDataModel');
const { generateTimeSlots } = require('../helpers/dateHelper');
const moment = require('moment-timezone');


//save post data to database
async function saveFormData(req, res) {
  // Extract form data from req.body
  const { newDate, newSelectedTimes, TestType, firstName, lastName, licenseNumber, age, dob, make, model, year, plateno } = req.body;

  // Get the susername from the session
  const susername = req.session.susername;

   // Basic validation: Check if required fields are provided
   if (!newDate || !newSelectedTimes) {
    const error = {
      message: 'Select booking slot first',
    };
    return res.render('g2_page', { error });
  }
  // Basic validation: Check if required fields are provided
  if (!firstName || !lastName || !licenseNumber || !age || !dob || !make || !model || !year || !plateno) {
    const error = {
      message: 'All fields are required!',
    };
    return res.render('g2_page', { error });
  }

  // Basic validation: Check if the licenseNumber is provided and has a valid format.
  if (!licenseNumber || !/^DL\d{6}$/.test(licenseNumber)) {
    const error = {
      message: 'Invalid license number format',
    };
    return res.render('g2_page', { error });
  }

  // Validate the license plate number format
  if (!/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(plateno)) {
    const error = {
      message: 'Invalid plate number format!',
    };
    return res.render('g2_page', { error });
  }

  // Encrypt the license number before updating
  const saltRounds = 10;
  const hashedLicenseNumber = await bcrypt.hash(licenseNumber, saltRounds);
 
  try {

    // Check if the user already has an appointment on the selected date
    const existingAppointment = await Appointment.findOne({
      date: new Date(newDate),
      'time.bookby': susername,
    });

    if (existingAppointment) {
      const error = {
        message: 'You already have an appointment on this date.',
      };
      return res.render('g2_page', { error });
    }

    //this will help to remove the avail date from the list
    updateBookingStatus(newDate,newSelectedTimes,susername,TestType);
    // Update the user's data in the database based on the provided userId
    await UserData.updateOne({ susername: susername }, {
      firstName: firstName,
      lastName: lastName,
      licenseNumber: hashedLicenseNumber,
      age: age,
      dob: dob,
      car_details: {
        make: make,
        model: model,
        year: year,
        platno: plateno,
      },
    });

    console.log('Data updated successfully');
    return res.render('g2_page', { success: 'Your Drive Test Booking successfully updated!' });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Error updating data in the database');
  }
}

async function updateBookingStatus(date, timeSlotValue, suser, TestType) {
  try {
    const result = await Appointment.updateOne(
      { date: new Date(date), 
        'time.value': timeSlotValue 
      },
      { $set: { 'time.$.isbooked': false, 
                'time.$.bookby': suser, 
                'time.$.TestType': TestType
               } 
      }

    );

    if (result.modifiedCount === 1) {
      console.log(`Booking status updated successfully for ${date} and ${timeSlotValue}`);
    } else {
      console.log(`No matching document found for ${date} and ${timeSlotValue}`);
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

async function fetchFormData(req, res) {
  try {
    // Retrieve the user from the database using the susername from the session
    const susername = req.session.susername;
    const user = await UserData.findOne({ susername });

    if (user) {
      // Render the user's details on the 'g_page' template
      console.log(user);
      res.render('g_page', { user });
    } else {
      const error = {
        message: 'User not found or data not available',
      };
      res.render('g_page', { error });
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Error fetching user data from the database');
  }
}

// Update car information based on the session (susername)
async function updatecarinfo(req, res) {
  const { make, model, year, plateno } = req.body;
  const susername = req.session.susername;

  // Basic validation: Check if required fields are provided
  if (!make || !model || !year || !plateno) {
    return res.status(400).send('All fields are required for car update');
  }

  // Validate the license plate number format
  if (!/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(plateno)) {
    return res.status(400).send('Invalid plate number format!');
  }

  try {
    // Find the user by their susername from the session
    const user = await UserData.findOne({ susername });

    if (user) {
      // Update car information
      user.car_details.make = make;
      user.car_details.model = model;
      user.car_details.year = year;
      user.car_details.platno = plateno;

      // Save the updated user data
      await user.save();
      console.log('Data successfully updated.');

      return res.render('g_page', { success: 'Data successfully updated' });
    } else {
      // Handle case when the user is not found
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error updating car information:', err);
    res.status(500).send('Error updating car information');
  }
}



//signup
async function savesignup(req, res) {
  // Extract form data from req.body
  const { susername, password, userType } = req.body;

  // Check if username and password are provided
  if (!susername || !password) {
    const error = {
      message: 'Username and password are required!',
    };
    return res.render('login', { error });
  }


  // Validate username uniqueness
  const existingUser = await UserData.findOne({ susername });
  if (existingUser) {
    const error = {
      message: 'Username is already taken. Please choose a different one'
    };
    return res.render('login', { error });
  }


  // You can create a new instance of the UserData model with the provided fields
  const userData = new UserData({
    susername: susername,
    password: password,
    userType: userType,
  });

  try {
    // Save the user data to the database
    await userData.save();
    console.log('User registered successfully');
    // Redirect to a success page or your dashboard
    const success = {
      message: 'User registered successfully, you can now login.',
    };
    return res.render('login', { success });


  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }

}


//login auth
async function authentication(req, res) {
  // Extract form data from req.body
  const { username, loginPassword } = req.body;

  // Inside the POST request handler
  const user = await UserData.findOne({ susername: username });

  if (user) {
    bcrypt.compare(loginPassword, user.password, (err, result) => {
      if (result) {
        // Passwords match, authentication is successful
        req.session.susername = user.susername;
        req.session.userType = user.userType;

        res.redirect('/'); // Redirect to G_page or another page
      } else {
        // Passwords do not match, display an error message
        console.log('Invalid username or password');
        const error = {
          message: 'Invalid username or password',
        };
        return res.render('login', { error });

      }
    });
  } else {
    // User with the provided username not found, display an error message
    const error = {
      message: 'Invalid username or password, user not exist! Create a new account.',
    };
    return res.render('login', { error });
    console.log('Invalid username or password or no such data found! Signup First');
  }

}
// check if the user data are default or not
async function findFieldsWithDefaultValues(susername) {
  try {
    // Retrieve the user from the database using the susername
    const user = await UserData.findOne({ susername });

    if (!user) {
      return 'User not found';
    }

    const defaults = {
      firstName: 'default',
      lastName: 'default',
      licenseNumber: 'default',
      age: 0,
      car_details: {
        make: 'default',
        model: 'default',
        year: 0,
        platno: 'default',
      },
    };

    const fieldsWithDefaultValues = [];

    for (const key in defaults) {
      if (JSON.stringify(user[key]) === JSON.stringify(defaults[key])) {
        fieldsWithDefaultValues.push(key);
      }
    }

    if (fieldsWithDefaultValues.length === 0) {
      return 'Values are upto date';
    }

    return 'Fields with default values: ' + fieldsWithDefaultValues.join(', ') + '<a href="/g2">. Click here to update</a>';
  } catch (err) {
    console.error('Error checking user data:', err);
    return 'Error checking user data';
  }
}

async function appointmentsave(req, res) {
  try {
    const selectedTimes = req.body.selectedTimes;
    const selectedDate = req.body.date;

    const timeSlots = generateTimeSlots('09:00', '14:00', 30);

    // Check if date and time are present
    if (!selectedDate || !selectedTimes) {
      const error = {
        message: 'Invalid date or time data.',
      };
      return res.render('appointment', { error, timeSlots });
    }

    // Check if the same time slot already exists for the selected date
    const existingAppointments = await Appointment.find({ date: selectedDate });

    if (existingAppointments.length > 0) {
      // If existing slots found, update the availability of selected time slots
      existingAppointments.forEach(async (existingAppointment) => {
        selectedTimes.forEach((selectedTime) => {
          const timeSlotIndex = existingAppointment.time.findIndex(
            (timeSlot) => timeSlot.value === selectedTime
          );
          if (timeSlotIndex !== -1) {
            existingAppointment.time[timeSlotIndex].isAvailable = false;
          }
        });
        await existingAppointment.save();
      });

      console.log('Appointment time updated successfully');
      const success = {
        message: 'Appointment time updated successfully',
      };
      return res.render('appointment', { success });
    } else {
      // If no existing slots found, save the new appointment
      const appointmentData = {
        date: selectedDate,
        time: timeSlots.map((timeSlot) => ({ value: timeSlot, isAvailable: true })),
      };
      selectedTimes.forEach((selectedTime) => {
        const timeSlotIndex = appointmentData.time.findIndex(
          (timeSlot) => timeSlot.value === selectedTime
        );
        if (timeSlotIndex !== -1) {
          appointmentData.time[timeSlotIndex].isAvailable = false;
        }
      });

      await Appointment.create(appointmentData);
      console.log('New appointment saved successfully');
      const success = {
        message: 'New appointment saved successfully',
      };
      return res.render('appointment', { success });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// Function to fetch appointments with user details
async function getAppointmentsWithUserDetails() {
  try {
    const result = await Appointment.aggregate([
      {
        $lookup: {
          from: 'users_collections',
          localField: 'time.bookby',
          foreignField: 'susername',
          as: 'userDetails'
        }
      }
    ]);
      moment.tz.setDefault('America/Toronto');
    // Iterate through each result and log each time slot separately
    result.forEach(appointment => {
      appointment.time.forEach(slot => {
        if (
          slot.isAvailable === false &&
          slot.isbooked === false &&
          slot.bookby !== null
        ) {
          // Convert the date to the desired timezone (e.g., 'America/Toronto')
          const formattedDate = moment.utc(appointment.date).format('YYYY-MM-DD');
          appointment.date=formattedDate;
          console.log('Appointment Details:');
          console.log('Date:', formattedDate);
          console.log('Booked By:', slot.bookby);
          console.log('Test Type:', slot.TestType);
          console.log('----------------------');
        }
      });
    });

    console.log(result,"result");

    return result;
  } catch (error) {
    console.error('Error fetching all appointments with user details:', error);
    throw error; // Handle the error or propagate it
  }
}

async function updateDriverstatus(req, res) {
  // Destructure relevant information from req.body
  const { susername, slot, status, comment, providedDate  } = req.body;

  console.log(req.body,"req.body");

  // Basic validation: Check if required fields are provided
  if (!susername || !slot || !status || !comment || !providedDate) {
    return res.status(400).send('All fields are required');
  }
  const currentTime = moment().tz(req.timezone).format('YYYY-MM-DD HH:mm:ss');
  //console.log(`Current time in ${req.timezone}: ${currentTime}`);

  try {
     // Convert the provided date to a JavaScript Date object
     const dateObject = new Date(providedDate);
    // Find the time slot by susername and slot from the Appointment model
    const updatedTimeSlot = await Appointment.findOneAndUpdate(
      {
        date: dateObject,
        'time': {
          $elemMatch: {
            'value': slot,
            'bookby': susername
          }
        }
      },
      {
        $set: {
          'time.$.status': status,
          'time.$.comment': comment
        }
      },
      { new: true }
    );
    // Check if the record was found and updated
    if (updatedTimeSlot) {
      console.log(`Status and comment successfully updated for slot ${slot} by ${susername}.`);
      const success = {
        message: 'Status and comment successfully updated',
      };

      // Render the 'examiner' view with success message and AppointList data
      return res.render('examiner', {
        success 
      });
      
    } else {
      // Handle case when the time slot is not found
      console.log(`No slot found for slot ${slot} and user ${susername}.`);
      return res.status(404).send('Time slot not found');
    }
  } catch (err) {
    console.error('Error updating time slot information:', err);
    return res.status(500).send('Error updating time slot information');
  }
}

async function findAppointmentsByUsername(req, res) {
  // Retrieve the user from the database using the susername from the session
  const susername = req.session.susername;

  try {
    // Find appointments where any time slot is booked by the specified username
    const appointments = await Appointment.find({ 'time.bookby': susername });

    if (appointments.length > 0) {
      // Filter time slots based on 'bookby' field (e.g., "driver")
      const filteredAppointments = appointments.reduce((result, appointment) => {
        const filteredTimeSlots = appointment.time.filter(slot => slot.bookby === "driver");
        if (filteredTimeSlots.length > 0) {
          result.push({
            ...appointment.toObject(), // Convert Mongoose document to plain JavaScript object
            time: filteredTimeSlots,
          });
        }
        return result;
      }, []);

      console.log(filteredAppointments);
      return filteredAppointments;
    } else {
      const error = {
        message: 'User not found or data not available',
      };
      console.error('User not found or data not available');
      //throw error; // Throw an error or handle it based on your application's logic
    }
  } catch (error) {
    console.error('Error finding appointments by username:', error);
    throw error; // Handle the error or propagate it
  }
}


module.exports = {
  savesignup,
  authentication,
  saveFormData,
  fetchFormData,
  updatecarinfo,
  findFieldsWithDefaultValues,
  appointmentsave,
  getAppointmentsWithUserDetails,
  updateDriverstatus,
  findAppointmentsByUsername
};