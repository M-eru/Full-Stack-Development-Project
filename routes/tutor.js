const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");

// Content Pages
router.get("/content", (req, res) => {
  res.render("tutor/content");
});

router.get("/qns", (req, res) => {
  ssn = req.session;
  Promise.all([
    Question.findAll({ include: { model: QnOption, required: true } }),
    Question.findAll({ where: { qnTypeId: 2 } }),
    QnType.findAll(),
    Tutorial.findOne({ where: { tutName: ssn.tutorial } }),
  ]).then((data) => {
    // console.log(JSON.stringify(data, null, 2));
    res.render("tutor/qns", {
      mcqqn: data[0],
      oeqn: data[1],
      qnType: data[2],
      tutorial: data[3],
    });
  });
});

// Question Forms
router.get("/mcq", (req, res) => {
  res.render("tutor/mcq");
});

router.get("/oe", (req, res) => {
  res.render("tutor/oe");
});

// Edit Forms
router.get("/editMcq/:id", (req, res) => {
  Question.findByPk(req.params.id, {
    include: { model: QnOption, required: true },
  }).then((question) => {
    res.render("tutor/editMcq", { question });
  });
});

router.get("/editOe/:id", (req, res) => {
  Question.findByPk(req.params.id).then((question) => {
    res.render("tutor/editOe", { question });
  });
});

// Delete Questions
router.get("/deleteMcq/:id", async function (req, res) {
  let result = await Question.destroy({ where: { id: req.params.id } });
  let option = await QnOption.destroy({ where: { qnId: req.params.id } });
  console.log(result + " question deleted.");
  console.log(option + " question options deleted.")
  res.redirect("/tutor/qns");
});

router.get("/deleteOe/:id", async function (req, res) {
  let result = await Question.destroy({ where: { id: req.params.id } });
  console.log(result + " question deleted.");
  res.redirect("/tutor/qns");
});

// Posts
router.post("/content", (req, res) => {
  let ssn = req.session;
  let tutName = req.body.tutorial;
  ssn.tutorial = tutName;

  Tutorial.create({
    tutName,
  })
    .then((tut) => {
      console.log(tut.toJSON());
      res.redirect("/tutor/qns");
    })
    .catch((err) => console.log(err));
});

router.post("/qns", (req, res) => {
  let qnType = req.body.qnType;
  if (qnType == "Multiple Choice") {
    res.redirect("/tutor/mcq");
  } else if (qnType == "Open Ended") {
    res.redirect("/tutor/oe");
  }
});

router.post("/mcq", (req, res) => {
  let question = req.body.qn;
  let ans1 = req.body.ans1;
  let ans2 = req.body.ans2;
  let ans3 = req.body.ans3;
  let ans4 = req.body.ans4;
  let correctAns = req.body.correctAns;
  let qnTypeId = 1;

  Question.create({
    question,
    correctAns,
    qnTypeId,
  })
    .then((question) => {
      console.log(question.toJSON());
      qnId = question.id;
      QnOption.create({
        ans1,
        ans2,
        ans3,
        ans4,
        qnId,
      })
        .then((options) => {
          console.log(options.toJSON());
          res.redirect("/tutor/qns");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/oe", (req, res) => {
  let question = req.body.qn;
  let correctAns = req.body.correctAns;
  let qnTypeId = 2;

  Question.create({
    question,
    correctAns,
    qnTypeId,
  })
    .then((question) => {
      console.log(question.toJSON());
      res.redirect("/tutor/qns");
    })
    .catch((err) => console.log(err));
});

router.post("/editMcq/:id", (req, res) => {
  let question = req.body.qn;
  let ans1 = req.body.ans1;
  let ans2 = req.body.ans2;
  let ans3 = req.body.ans3;
  let ans4 = req.body.ans4;
  let correctAns = req.body.correctAns;

  Question.update(
    {
      question,
      correctAns,
    },
    { where: { id: req.params.id } }
  )
    .then((question) => {
      console.log(question[0] + " question updated.");
      QnOption.update(
        {
          ans1,
          ans2,
          ans3,
          ans4,
        },
        { where: { qnId: req.params.id } }
      )
        .then((options) => {
          console.log(options[0] + " question options updated.");
          res.redirect("/tutor/qns");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/editOe/:id", (req, res) => {
  let question = req.body.qn;
  let correctAns = req.body.correctAns;

  Question.update(
    {
      question,
      correctAns,
    },
    { where: { id: req.params.id } }
  )
    .then((question) => {
      console.log(question[0] + " question updated.");
      res.redirect("/tutor/qns");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
