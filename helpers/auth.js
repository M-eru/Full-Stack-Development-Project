const { upsert } = require("../models/Student");
const flashMessage = require("../helpers/messenger");

const ensureStudent = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "student") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/');
};

const ensureParent = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "parent") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/');
};

const ensureTutor = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "tutor") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/');
};

const ensureProfile = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role == "student" || req.user.role == "tutor") {
      return next();
    }
  }
  flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
  res.redirect('/');
};

module.exports = { ensureStudent, ensureParent, ensureTutor, ensureProfile };