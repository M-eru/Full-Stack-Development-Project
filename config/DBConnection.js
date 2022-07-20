const mySQLDB = require("./DBConfig");
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");

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

      mySQLDB.sync({
        force: drop,
      });
    })
    .catch((err) => console.log(err));
};
module.exports = { setUpDB };
