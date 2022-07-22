const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const ParentTutor = require("../models/ParentTutor");
const Student = require("../models/Student");

function localStrategy(passport) {

  // Strategy for student accounts
  passport.use(
    "student",
    new LocalStrategy({ usernameField: "admno" }, (admno, password, done) => {
      Student.findOne({ where: { admno: admno } }).then((user) => {
        console.log('Passport: Searched for user (student)');
        console.log(JSON.stringify(user, null, 2));
        if (password.length < 6) {
          console.log('Password is less than 6 characters, failed authentication');
          return done(null, false, { message: "Password must be at least 6 characters"});
        }
        if (!user) {
          console.log('No user found, failed authentication');
          return done(null, false, { message: "Incorrect username or password" });
        }
        // Match password
        isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          console.log('Password incorrect, failed authentication')
          return done(null, false, { message: "Incorrect username or password" });
        }
        // Authenticated
        // flashMessage(res, "success", admno + " logged in successfully");
        return done(null, user);
      });
    })
  );

  // Strategy for parent/tutor accounts
  passport.use(
    "parent-tutor",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      ParentTutor.findOne({ where: { email: email } }).then((user) => {
        console.log('Passport: Searched for user (parent-tutor)');
        console.log(JSON.stringify(user, null, 2));
        if (password.length < 6) {
          console.log('Password is less than 6 characters, failed authentication');
          return done(null, false, { message: "Password must be at least 6 characters"});
        }
        if (!user) {
          console.log('No user found, failed authentication')
          return done(null, false, { message: "Incorrect username or password" });
        }
        // Match password
        isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          console.log('Password incorrect, failed authentication')
          return done(null, false, { message: "Incorrect username or password" });
        }
        // Authenticated
        // flashMessage(res, "success", email + " logged in successfully");
        return done(null, user);
      });
    })
  );
  // Serializes (stores) user id into session upon successful
  // authentication
  passport.serializeUser((user, done) => {
    // user.id is used to identify authenticated user
    done(null, user);
  });
  // User object is retrieved by userId from session and
  // put into req.user
  passport.deserializeUser((user, done) => {
    if (user.role == 'student') {
      console.log('Passport: Confirmed user role as student')
      Student.findByPk(user.id)
      .then((user) => {
        done(null, user);
        // user object saved in req.session
      })
      .catch((done) => {
        // No user found, not stored in req.session
        console.log(done);
      });
    }

    else if (user.role == 'parent' || user.role == 'tutor') {
      console.log('Passport: Confirmed user role as', user.role)
      ParentTutor.findByPk(user.id)
      .then((user) => {
        done(null, user);
        // user object saved in req.session
      })
      .catch((done) => {
        // No user found, not stored in req.session
        console.log(done);
      });
    }
  });
}
module.exports = { localStrategy };
