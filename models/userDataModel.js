// models/userDataModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

  // const userDataSchema = new mongoose.Schema({
  //   firstName: String,
  //   lastName: String,
  //   licenseNumber: String,
  //   age: Number,
  //   dob: Date,
  //   username: String,
  //   password: String, 
  //   userType: String, 
  //   car_details: {
  //     make: String,
  //     model: String,
  //     year: Number,
  //     platno: String,
  //   },
  // });

  const userDataSchema = new mongoose.Schema({
    TestType: {
      type: String,
      default: 'default',
    },
    firstName: {
      type: String,
      default: 'default',
    },
    lastName: {
      type: String,
      default: 'default',
    },
    licenseNumber: {
      type: String,
      default: 'default',
    },
    age: {
      type: Number,
      default: 0,
    },
    dob:{ 
      type: Date,
      default: Date.now
    },
    susername: {
      type: String,
    },
    password: {
      type: String,
    },
    userType: {
      type: String,
    },
    car_details: {
      make: {
        type: String,
        default: 'default',
      },
      model: {
        type: String,
        default: 'default',
      },
      year: {
        type: Number,
        default: 0,
      },
      platno: {
        type: String,
        default: 'default',
      },
    },
  });
 
 // Hash the password before saving
userDataSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
}); 

const UserData = mongoose.model('users_collection', userDataSchema);

module.exports = UserData;