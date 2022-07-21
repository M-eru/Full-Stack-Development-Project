const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
function localStrategy(passport) {
  passport.use(
    "local",
    new LocalStrategy({ usernameField: "admno" }, (admno, password, done) => {
      Student.findOne({ where: { admno: admno } }).then((user) => {
        console.log(JSON.stringify(user, null, 2));
        if (!user) {
          return done(null, false, { message: "No User Found" });
        }
        // Match password
        isMatch = bcrypt.compareSync(password, user.password);
        console.log(user.admno, password, isMatch)
        if (!isMatch) {
          return done(null, false, { message: "Password incorrect" });
        }
        return done(null, user);
      });
    })
  );
  // Serializes (stores) user id into session upon successful
  // authentication
  passport.serializeUser((user, done) => {
    // user.id is used to identify authenticated user
    done(null, user.id);
  });
  // User object is retrieved by userId from session and
  // put into req.user
  passport.deserializeUser((userId, done) => {
    User.findByPk(userId)
      .then((user) => {
        done(null, user);
        // user object saved in req.session
      })
      .catch((done) => {
        // No user found, not stored in req.session
        console.log(done);
      });
  });
}
module.exports = { localStrategy };
