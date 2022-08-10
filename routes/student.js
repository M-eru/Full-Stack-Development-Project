const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const Tutorial = require("../models/Tutorial");
const Answer = require("../models/Answer");
const ensureAuthenticated = require("../helpers/auth");
const sequelize = require("sequelize");

// Functions

function upsert(values, qnId, studentId) {
  return Answer.findOne({ where: { qnId: qnId, studentId: studentId } }).then(
    function (obj) {
      if (obj) {
        return obj.update(values);
      } else {
        return Answer.create(values);
      }
    }
  );
}

router.get("/tutorials/:id", ensureAuthenticated.ensureStudent, (req, res) => {
  Tutorial.findByPk(req.params.id, {
    include: { model: Question, include: { model: QnOption } },
    order: [[Question, "qnOrder", "ASC"]],
  }).then((data) => {
    res.render("student/tutorial", { data: data });
  });
});

router.get("/tutorial", ensureAuthenticated.ensureStudent, (req, res) => {
  res.render("student/tutorial");
});

router.get("/content", ensureAuthenticated.ensureStudent, (req, res) => {
  Tutorial.findAll().then(async function (tutorials) {
    let status = null;
    await Answer.findOne({
      where: { studentId: req.user.id },
    }).then((result) => {
      if (result) {
        status = "completed";
      }
      res.render("student/content", {
        data: { tutorials: tutorials, status: status },
      });
    });
  });
});

router.get(
  "/result/:id",
  ensureAuthenticated.ensureStudent,
  async function (req, res) {
    await Tutorial.findByPk(req.params.id, {
      include: [{ model: Question, include: [QnOption, Answer] }],
    }).then(async function (data) {
      // console.log(JSON.stringify(data, null, 2));
      let status = "uncompleted";
      const score = await Answer.count({
        where: { studentId: req.user.id, input: null },
      });
      await Answer.findOne({
        where: { studentId: req.user.id },
      }).then((result) => {
        if (result) {
          status = "completed";
        }
      });
      res.render("student/result", {
        data: { tut: data, score: score, status: status },
      });
    });
  }
);

// Posts

router.post(
  "/tutorials/:id",
  ensureAuthenticated.ensureStudent,
  async function (req, res) {
    // Tutorial ID, Score and qnId Array
    let tutorialId = req.body.tutId;
    let ids = req.body.id;
    // console.log("Tutorial: " + tutorialId);
    // console.log("Qn: " + ids);

    // Question Answers
    if (Array.isArray(req.body.id) == true) {
      ids.forEach(async function (qnId) {
        let input = req.body[qnId];
        // console.log("Answer: " + req.body[item]);
        await Question.findByPk(qnId).then((i) => {
          // console.log(JSON.stringify(i, null, 2));
          // console.log("Correct Answer: " + i.correctAns);
          let ans = i.correctAns;
          if (input == ans) {
            // console.log("Answer: " + input + " Correct Answer: " + ans);
            // Answer.create({
            //   ans,
            //   qnId,
            // });
            upsert(
              { ans: ans, input: null, qnId: qnId, studentId: req.user.id },
              qnId,
              req.user.id
            );
          } else if (input !== ans) {
            // console.log("Failed Answer: " + input + " Correct Answer: " + ans);
            // Answer.create({
            //   ans,
            //   input,
            //   qnId,
            // });
            upsert(
              { ans: ans, input: input, qnId: qnId, studentId: req.user.id },
              qnId,
              req.user.id
            );
          }
        });
      });
    } else {
      let qnId = ids;
      let input = req.body[qnId];
      await Question.findByPk(ids).then((i) => {
        let ans = i.correctAns;
        if (input == ans) {
          // console.log("Answer: " + input + " Correct Answer: " + ans);
          // Answer.create({
          //   ans,
          //   qnId,
          // });
          upsert(
            { ans: ans, input: null, qnId: qnId, studentId: req.user.id },
            qnId,
            req.user.id
          );
        } else if (input !== ans) {
          // console.log("Failed Answer: " + input + " Correct Answer: " + ans);
          // Answer.create({
          //   ans,
          //   input,
          //   qnId,
          // });
          upsert(
            { ans: ans, input: input, qnId: qnId, studentId: req.user.id },
            qnId,
            req.user.id
          );
        }
      });
    }

    // Redirect to result page
    res.redirect("/student/result/" + tutorialId);
  }
);

module.exports = router;
