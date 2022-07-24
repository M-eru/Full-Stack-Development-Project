const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");

router.get("/tutorials/:id", (req, res) => {
  Promise.all([
    Question.findAll(
      { include: { model: QnOption, required: true } },
      { where: { tutorialId: req.params.id} },
    ),
    Question.findAll({ where: { tutorialId: req.params.id, qnTypeId: 2 } }),
    Tutorial.findByPk(req.params.id),
  ]).then((data) => {
    res.render("student/tutorial", {
      mcqqn: data[0],
      oeqn: data[1],
      tutorial: data[2],
    });
  });
});

router.get("/tutorial", (req, res) => {
  res.render("student/tutorial");
});

module.exports = router;
