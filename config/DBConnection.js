const mySQLDB = require("./DBConfig");
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const ParentTutor = require("../models/ParentTutor");
const Student = require("../models/Student");
const User = require("../models/User");
const Badge = require("../models/Badge");
const Card = require("../models/Card");
const Answer = require("../models/Answer");

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
  mySQLDB
    .authenticate()
    .then(() => {
      console.log("Database connected.");
      // Reminder if drop is set to true
      if (drop) {
        console.log("Drop set to true.");
      }

      // Defines relationships
      QnType.hasMany(Question);
      Question.belongsTo(QnType);

      Tutorial.hasMany(Question, { onDelete: "CASCADE" });
      Question.belongsTo(Tutorial);

      Question.hasOne(QnOption, { onDelete: "CASCADE" });
      QnOption.belongsTo(Question);

      Student.hasMany(Answer);
      Answer.belongsTo(Student);

      Question.hasOne(Answer);
      Answer.belongsTo(Question);

      // Parent and tutor accounts are grouped in the same table.
      ParentTutor.hasMany(Student);
      Student.belongsTo(ParentTutor);

      User.hasMany(Badge);
      Badge.belongsTo(User);

      ParentTutor.hasMany(Card);
      Card.belongsTo(ParentTutor);
      // Student is just for my code to work. Will be changed to user accordingly.
      // Student = User

      mySQLDB.sync({
        force: drop,
      });
    })
    .catch((err) => console.log(err));
};
module.exports = { setUpDB };
