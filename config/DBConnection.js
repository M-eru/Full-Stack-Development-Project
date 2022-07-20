const mySQLDB = require("./DBConfig");
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const ParentTutor = require('../models/ParentTutor');
const Student = require('../models/Student');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Student = require('../models/Student');
const Card = require('../models/Card');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
  mySQLDB
    .authenticate()
    .then(() => {
      console.log("Database connected.");

      // Defines relationships
      QnType.hasMany(Question);
      Question.belongsTo(QnType);

      Tutorial.hasMany(Question);
      Question.belongsTo(Tutorial);

      Question.hasOne(QnOption);
      QnOption.belongsTo(Question);

      // Parent and tutor accounts are grouped in the same table.
      ParentTutor.hasMany(Student);
      Student.belongsTo(ParentTutor);

      User.hasMany(Badge);
      Badge.belongsTo(User);

      Student.hasMany(Card);
      Card.belongsTo(Student);
      // Student is just for my code to work. Will be changed to user accordingly.
      // Student = User

      mySQLDB.sync({
        force: drop,
      });
    })
    .catch((err) => console.log(err));
};
module.exports = { setUpDB };
