const express = require("express");
const router = express.Router();
const flashMessage = require("../helpers/messenger");
const moment = require('moment');
const Student = require("../models/Student");
const ParentTutor = require("../models/ParentTutor");
const Payment_Duration = require("../models/Payment_Duration");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const ensureAuthenticated = require('../helpers/auth');
const sequelize = require("sequelize");

router.get("/signup/student", ensureAuthenticated.ensureNotAuthenticated, (req, res) => {
  res.render("user/signup_std");
});

router.get("/signup/parent-tutor", ensureAuthenticated.ensureNotAuthenticated, (req, res) => {
  res.render("user/signup_pt");
});

router.get("/login/student", ensureAuthenticated.ensureNotAuthenticated, (req, res) => {
  res.render("user/login_std");
});

router.get("/login/parent-tutor", ensureAuthenticated.ensureNotAuthenticated, (req, res) => {
  res.render("user/login_pt");
});

router.get("/redirect", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect(ensureAuthenticated.getHomepage(req.user.role));
  }
  else { res.redirect('/'); }
});

router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("user/profile")
  }
  else {
    res.redirect("/")
  }
});

router.post("/signup/student", async function (req, res) {
  let { name, admno, password, cpassword } = req.body;

  let isValid = true;
  if (!(admno.charAt(0) == "1")) {
    flashMessage(res, "error", "Admin no. has to start with 1");
    isValid = false;
  }

  if (password.length < 6) {
    flashMessage(res, "error", "Password must be at least 6 characters");
    isValid = false;
  }

  if (password != cpassword) {
    flashMessage(res, "error", "Passwords do not match");
    isValid = false;
  }

  if (!isValid) {
    res.render("user/signup_std", { name, admno });
    return;
  }

  try {
    // If all is well, checks if student is already registered
    let student = await Student.findOne({ where: { admno: admno } });
    if (student) {
      // If student is found, that means admin number has already been registered
      flashMessage(res, "error", admno + " alreay registered");
      res.render("user/signup_std", { name, admno });
    } else {
      // Set year according to admin no.
      let year = 1;

      // Create new user record
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      // Use hashed password
      let student = await Student.create({
        name,
        admno,
        password: hash,
        year, 
        role: "student",
        status: "active",
        payed: false
      });

      // Adding payment_duration details to Payment_Duration model (Yee Jin)
      let myStudentId = student.id;
      Payment_Duration.create({
        studentId: myStudentId
      });
      // let startDate = moment(sequelize.fn('date', sequelize.col('createdAt'), '%Y-%m-%d'));
      let startDate1 = moment(new Date()).format('YYYY-MM-DD');
      let endDate = moment(startDate1).add(1, 'Y');
      let endDate1 = moment(endDate).format('YYYY-MM-DD');
      Payment_Duration.update({
        startDate: startDate1,
        endDate: endDate1
      },
      { where: {studentId: myStudentId} });

      console.log(
        "New student registered:",
        "\n---\nName: ",
        name,
        "\nAdmin No.: ",
        admno,
        "\nPassword: ",
        hash,
        "\n---\n"
      );
      flashMessage(res, "success", admno + " registered successfully");
      res.redirect("/user/login/student");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/signup/parent-tutor", async function (req, res) {
  let { name, email, password, cpassword } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, "error", "Password must be at least 6 characters");
    isValid = false;
  }

  if (password != cpassword) {
    flashMessage(res, "error", "Passwords do not match");
    isValid = false;
  }

  if (!isValid) {
    res.render("user/signup_pt", { name, email });
    return;
  }

  try {
    // If all is well, checks if parent is already registered
    let parent_tutor = await ParentTutor.findOne({ where: { email: email } });
    if (parent_tutor) {
      // If parent is found, that means email has already been registered
      flashMessage(res, "error", email + " alreay registered");
      res.render("user/signup_pt", { name, email });
    } else {
      // Create new user record
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      // Use hashed password
      let parent_tutor = await ParentTutor.create({
        name,
        email,
        password: hash,
        role: "parent",
        status: "active",
      });
      flashMessage(res, "success", email + " registered successfully");
      console.log(
        "New parent/tutor registered:",
        "\n---\nName: ",
        name,
        "\nEmail: ",
        email,
        "\nPassword: ",
        hash,
        "\n---\n"
      );
      res.redirect("/user/login/parent-tutor");
    }
  } catch (err) {
    console.log(err);
  }
});

// Temporary code pulled from idk whose code
router.post("/login/student", (req, res, next) => {
  passport.authenticate("student", {
    // Success redirect URL
    successRedirect: "/user/redirect",
    // Failure redirect URL
    failureRedirect: "/user/login/student",
    // boolean to generate a flash message
    failureFlash: true,
  })(req, res, next);
});

router.post("/login/parent-tutor", (req, res, next) => {
  passport.authenticate("parent-tutor", {
    // Success redirect URL
    successRedirect: "/user/redirect",
    // Failure redirect URL
    failureRedirect: "/user/login/parent-tutor",
    // boolean to generate a flash message
    failureFlash: true,
  })(req, res, next);
});

router.post("/profile", async function (req, res) {
  let { name, detail, password, cpassword } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, "error", "New password must be at least 6 characters");
    isValid = false;
  }

  if (password != cpassword) {
    flashMessage(res, "error", "Passwords do not match");
    isValid = false;
  }

  if (!isValid) {
    res.render("user/profile");
    return;
  }

  if (req.user.role == "student") {
    Student.update(
      { password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)) },
      { where: { id: req.user.id } })
      .then((result) => {
          console.log('Student Id: ' + result[0] + ' has been updated');
          flashMessage(res, 'success', detail + ' has been updated successfully');
      })
      .catch(err => console.log(err));
  }
  else {
    ParentTutor.update(
      { name, email: detail, password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)) },
      { where: { id: req.user.id } })
      .then((result) => {
        console.log('Parent-Tutor Id: ' + result[0] + ' has been updated');
        flashMessage(res, 'success', detail + ' has been updated successfully');
      })
  }
  res.redirect(ensureAuthenticated.getHomepage(req.user.role))
});

router.get("/logout", (req, res) => {
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      flashMessage(res, "success", "Logged out successfully");
      console.log("User logged out.")
      res.redirect("/");
    });
  }
  else {
    res.redirect("/")
  }
});

module.exports = router;
