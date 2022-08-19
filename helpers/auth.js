const { upsert } = require("../models/Student");
const flashMessage = require("../helpers/messenger");

const ensureStudent = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "student") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/user/redirect');
};

const ensureParent = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "parent") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/user/redirect');
};

const ensureTutor = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "tutor") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/user/redirect');
};

// Check if there is no user logged in (used for sign up/login pages)
const ensureNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  flashMessage(res, "error", "User already logged in.");
  res.redirect('/user/redirect');
};

// Redirects user to different homepages depending on their role
const getHomepage = (role) => {
  if (role) {
    switch (role) {
      case "student":
        return '/student/content';
      
      case "parent":
        return '/parent/studentProfile_select';
      
      case "tutor":
        return '/tutor/content';
    }
  }
  else { return '/'; }
}

module.exports = { ensureStudent, ensureParent, ensureTutor, 
  ensureNotAuthenticated, getHomepage };