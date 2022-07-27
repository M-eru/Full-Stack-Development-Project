const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const flashMessage = require("../helpers/messenger");

router.get("/tutorials/:id", (req, res) => {
  Promise.all([
    Question.findAll(
      { include: { model: QnOption, required: true } },
      { where: { tutorialId: req.params.id } }
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

router.get("/content", (req, res) => {
  Tutorial.findAll().then((tutorials) => {
    res.render("student/content", { tutorials: tutorials });
  });
});

// Posts

router.post("/tutorials/:id", (req, res) => {
  console.log(req.body);
  // let mcq = Question.findAll(
  //   { include: { model: QnOption, required: true } },
  //   { where: { tutorialId: req.params.id } }
  // );
  // let oe = Question.findAll({
  //   where: { tutorialId: req.params.id, qnTypeId: 2 },
  // });
  // let score = 0;
  // for (i = 0; i < mcq.length; i++) {
  // }
  flashMessage(
    res,
    "success",
    "Tutorial has been submitted. View your score by clicking on the 'Score' Button!"
  );
  res.redirect("/student/content");
});

module.exports = router;
