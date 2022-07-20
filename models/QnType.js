const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const QnType = db.define("qnType", {
  qnType: { type: Sequelize.STRING },
});

// Creates question types if entries doesn't exist.

QnType.sync();

QnType.findOrCreate({
  where: { id: 1 },
  defaults: {
    qnType: "Multiple Choice",
  },
});

QnType.findOrCreate({
  where: { id: 2 },
  defaults: {
    qnType: "Open Ended",
  },
});

module.exports = QnType;
