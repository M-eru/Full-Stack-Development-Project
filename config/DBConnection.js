const mySQLDB = require("./DBConfig");
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const ParentTutor = require("../models/ParentTutor");
const Student = require("../models/Student");
const Badge = require("../models/Badge");
const Card = require("../models/Card");
const Answer = require("../models/Answer");
const Payment_Duration = require("../models/Payment_Duration");
// const sequelize = require("sequelize");
// const { Sequelize } = require("sequelize");
const student_badge = require("../models/student_badge");
//
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

      Tutorial.hasMany(Answer);
      Answer.belongsTo(Tutorial);

      // Parent and tutor accounts are grouped in the same table.
      ParentTutor.hasMany(Student);
      Student.belongsTo(ParentTutor);

      Student.belongsToMany(Badge, { through: student_badge });
      Badge.belongsToMany(Student, { through: student_badge });

      ParentTutor.hasMany(Badge);
      Badge.belongsTo(ParentTutor);

      ParentTutor.hasMany(Card);
      Card.belongsTo(ParentTutor);

      Payment_Duration.hasMany(Student);
      Student.belongsTo(Payment_Duration);

      mySQLDB.sync({
        force: drop,
      });
    })
    .catch((err) => console.log(err));
};
module.exports = { setUpDB };
