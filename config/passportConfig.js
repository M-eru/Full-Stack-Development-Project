const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const ParentTutor = require("../models/ParentTutor");
const Student = require("../models/Student");
function localStrategy(passport) {
  passport.use(
    "student",
    new LocalStrategy({ usernameField: "admno" }, (admno, password, done) => {
      Student.findOne({ where: { admno: admno } }).then((user) => {
        console.log(JSON.stringify(user, null, 2));
        if (!user) {
          console.log('No user found')
          return done(null, false, { message: "Incorrect username or password" });
        }
        // Match password
        isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect username or password" });
        }
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
      console.log('User role is student; searching Student table')
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

    else if (user.role in ('parent', 'tutor')) {
      console.log('User role is parent/tutor; searching ParentTutor table')
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
