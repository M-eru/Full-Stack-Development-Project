const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Student = require('../models/Student')
const ParentTutor = require('../models/ParentTutor');
const bcrypt = require('bcryptjs');

router.get('/login/student', (req, res) => {
  res.render('user/login_std');
});

router.get('/login/parent-tutor', (req, res) => {
  res.render('user/login_pt');
});

router.post('/login/parent-tutor', async function (req, res) {
  let { email, password } = req.body;

  // Validate password length (>=6)
  if (password.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
    res.render('user/login_pt', { email });
  }

  else {
    try {
      // If all is well, checks if user exists
      let user = await ParentTutor.findOne({ where: { email: email } });
      // console.log(JSON.stringify(user, null, 2));
      if (user == null) {
        // If user is not found, reject login attempt
        flashMessage(res, 'error', 'Incorrect username or password');
        res.render('user/login_pt', { email });
      } 
      
      else {
        // Compare hashed password
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match; allow login');
        if (match == true) {
          // If match, allow login
          flashMessage(res, 'success', 'Logged in successfully')
          res.render('index');
        }

        else {
          flashMessage(res, 'error', 'Incorrect username or password');
          res.render('user/login_pt', { email });
        }
      }
    } 

    catch (err) {
      console.log(err);
    }
  }
});

router.get('/signup/student', (req, res) => {
  res.render('user/signup_std');
});

router.post('/signup/student', async function (req, res) {
  let { name, admno, password, cpassword } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
    isValid = false;
  }

  if (password != cpassword) {
    flashMessage(res, 'error', 'Passwords do not match');
    isValid = false;
  }

  if (!isValid) {
    res.render('user/signup_std', { name, admno });
    return;
  }

  try {
    // If all is well, checks if student is already registered
    let student = await Student.findOne({ where: { admno: admno } });
    if (student) {
      // If student is found, that means admin number has already been registered
      flashMessage(res, 'error', admno + ' alreay registered');
      res.render('user/signup_std', { name, admno });
    } 
    
    else {
      // Create new user record
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      // Use hashed password
      let student = await Student.create({ name, admno, password: hash, role: 'student', status: 'active' });
      console.log('New student registered:', '\n---\nName: ', name, '\nAdmin No.: ', admno, '\nPassword: ', hash, '\n---\n');
      flashMessage(res, 'success', admno + ' registered successfully');
      res.redirect('/user/login/student');
    }
  } 
  
  catch (err) {
    console.log(err);
  }
});

router.get('/signup/parent-tutor', (req, res) => {
  res.render('user/signup_pt');
});

router.post('/signup/parent-tutor', async function (req, res) {
  let { name, email, password, cpassword } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
    isValid = false;
  }

  if (password != cpassword) {
    flashMessage(res, 'error', 'Passwords do not match');
    isValid = false;
  }

  if (!isValid) {
    res.render('user/signup_pt', { name, email });
    return;
  }

  try {
    // If all is well, checks if parent is already registered
    let parent_tutor = await ParentTutor.findOne({ where: { email: email } });
    if (parent_tutor) {
      // If parent is found, that means email has already been registered
      flashMessage(res, 'error', email + ' alreay registered');
      res.render('user/signup_pt', { name, email });
    } 
    
    else {
      // Create new user record
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      // Use hashed password
      let parent_tutor = await ParentTutor.create({ name, email, password: hash, role: 'parent', status: 'active' });
      flashMessage(res, 'success', email + ' registered successfully');
      console.log('New parent/tutor registered:', '\n---\nName: ', name, '\nEmail: ', email, '\nPassword: ', hash, '\n---\n');
      res.redirect('/user/login/parent-tutor');
    }
  } 
  
  catch (err) {
    console.log(err);
  }
});

module.exports = router;