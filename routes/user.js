const express = require("express");
const router = express.Router();
const flashMessage = require("../helpers/messenger");
const Student = require("../models/Student");
const ParentTutor = require("../models/ParentTutor");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/signup/student", (req, res) => {
  res.render("user/signup_std");
});

router.get("/signup/parent-tutor", (req, res) => {
  res.render("user/signup_pt");
});

router.get("/login/student", (req, res) => {
  res.render("user/login_std");
});

router.get("/login/parent-tutor", (req, res) => {
  res.render("user/login_pt");
});

router.post("/signup/student", async function (req, res) {
  let { name, admno, password, cpassword } = req.body;

  let isValid = true;
  if (!(admno.charAt(0) == "1" || admno.charAt(0) == "2")) {
    flashMessage(res, "error", "Admin no. has to start with either 1 or 2");
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
      let year = 0;
      // Set year according to admin no.
      if (admno.charAt(0) == "1") { year = 1; }
      else { year = 2; }

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
      });

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
    successRedirect: "/badge/badges",
    // Failure redirect URL
    failureRedirect: "/user/login/student",
    // boolean to generate a flash message
    failureFlash: true,
  })(req, res, next);
});

router.post("/login/parent-tutor", (req, res, next) => {
  passport.authenticate("parent-tutor", {
    // Success redirect URL
    successRedirect: "/",
    // Failure redirect URL
    failureRedirect: "/user/login/parent-tutor",
    // boolean to generate a flash message
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
