const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const Student = require("../models/Student");
const ParentTutor = require("../models/ParentTutor");
const flashMessage = require("../helpers/messenger");

// Content Pages
router.get("/content", (req, res) => {
  Tutorial.findAll().then((tutorials) => {
    res.render("tutor/content", { tutorials: tutorials });
  });
});

// router.get("/qns/:id", (req, res) => {
//   Promise.all([
//     Question.findAll(
//       { include: { model: QnOption, required: true } },
//       { where: { tutorialId: req.params.id } }
//     ),
//     Question.findAll({ where: { tutorialId: req.params.id, qnTypeId: 2 } }),
//     QnType.findAll(),
//     Tutorial.findByPk(req.params.id),
//   ]).then((data) => {
//     // console.log(JSON.stringify(data, null, 2));
//     res.render("tutor/qns", {
//       mcqqn: data[0],
//       oeqn: data[1],
//       qnType: data[2],
//       tutorial: data[3],
//     });
//   });
// });

router.get("/qns/:id", (req, res) => {
  Tutorial.findByPk(req.params.id, {
    include: { model: Question, include: { model: QnOption } },
    order: [[Question, "qnOrder", "ASC"]],
  }).then((data) => {
    console.log(JSON.stringify(data, null, 2));
    res.render("tutor/qns", { data: data });
  });
});

router.get("/tutorials/:id", (req, res) => {
  Tutorial.findByPk(req.params.id, {
    include: { model: Question, include: { model: QnOption } },
  }).then((data) => {
    console.log(JSON.stringify(data, null, 2));
    res.render("tutor/qns", { data: data });
  });
});

router.get("/preview", (req, res) => {
  res.render("tutor/preview");
});

// Question Forms
router.get("/mcq/:id", (req, res) => {
  res.render("tutor/mcq", { id: req.params.id });
});

router.get("/oe/:id", (req, res) => {
  res.render("tutor/oe", { id: req.params.id });
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
router.get("/deleteMcq/:id?", async function (req, res) {
  let result = await Question.destroy({ where: { id: req.params.id } });
  console.log(result + " question deleted.");
  res.redirect("/tutor/qns/" + req.query.tutId);
});

router.get("/deleteOe/:id?", async function (req, res) {
  let result = await Question.destroy({ where: { id: req.params.id } });
  console.log(result + " question deleted.");
  res.redirect("/tutor/qns/" + req.query.tutId);
});

router.get("/deleteTut/:id", async function (req, res) {
  let result = await Tutorial.destroy({ where: { id: req.params.id } });
  console.log(result + " tutorial deleted.");
  res.redirect("/tutor/content");
});

// Get parent details
router.get("/parent_details", (req, res) => {
  Student.findAll({
    include: { model: ParentTutor },
    order: [['admno', 'ASC']]
  }).then((students) => {
      console.log(students);
      res.render("tutor/parent_details", { students });
  })
})

// Posts
router.post("/content", (req, res) => {
  let tutName = req.body.tutorial;
  Tutorial.create({
    tutName,
  })
    .then((tut) => {
      console.log(tut.toJSON());
      res.redirect("/tutor/qns/" + tut.id);
    })
    .catch((err) => console.log(err));
});

router.post("/qnSubmit", (req, res) => {
  let qnType = req.body.qnType;
  if (qnType == "Multiple Choice") {
    res.redirect("/tutor/mcq/" + req.body.id);
  } else if (qnType == "Open Ended") {
    res.redirect("/tutor/oe/" + req.body.id);
  }
});

router.post("/tutSubmit", (req, res) => {
  flashMessage(res, "success", "Tutorial has been updated");
  res.redirect("/tutor/content");
});

router.post("/mcq", (req, res) => {
  let qnOrder = req.body.qnOrder;
  let question = req.body.qn;
  let ans1 = req.body.ans1;
  let ans2 = req.body.ans2;
  let ans3 = req.body.ans3;
  let ans4 = req.body.ans4;
  let correctAns = req.body.correctAns;
  let qnTypeId = 1;
  let tutorialId = req.body.id;

  Question.create({
    qnOrder,
    question,
    correctAns,
    qnTypeId,
    tutorialId,
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
          flashMessage(res, "success", "Multiple choice question created.");
          res.redirect("/tutor/qns/" + tutorialId);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/oe", (req, res) => {
  let qnOrder = req.body.qnOrder;
  let question = req.body.qn;
  let correctAns = req.body.correctAns;
  let qnTypeId = 2;
  let tutorialId = req.body.id;

  Question.create({
    qnOrder,
    question,
    correctAns,
    qnTypeId,
    tutorialId,
  })
    .then((question) => {
      console.log(question.toJSON());
      flashMessage(res, "success", "Open ended question created.");
      res.redirect("/tutor/qns/" + tutorialId);
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
          flashMessage(res, "success", "Multiple choice question updated.");
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
      flashMessage(res, "success", "Open ended question updated.");
      res.redirect("/tutor/qns");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
