const { upsert } = require("../models/Student");
const flashMessage = require("../helpers/messenger");

const ensureAuthenticated = (req, res, next) => {
  role = 'student'
  switch (role) {
    case "student":
      if (req.isAuthenticated()) {
        if (req.user.role == "student") {
          return next();
        }
      }
      flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
      res.redirect('/');
      break;

    case "tutor":
      if (req.isAuthenticated()) {
        if (req.user.role == "tutor") {
          return next();
        }
      }
      flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
      res.redirect('/');
      break;

    case "profile":
      if (req.isAuthenticated()) {
        if (req.user.role == "student" || req.user.role == "tutor") {
          return next();
        }
      }
      flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
      res.redirect('/');
      break;

    case "parent":
      if (req.isAuthenticated()) {
        if (req.user.role == "parent") {
          return next();
        }
      }
      flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
      res.redirect('/');
      break;
  }
};
module.exports = ensureAuthenticated;