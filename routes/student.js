const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const Tutorial = require("../models/Tutorial");
const Answer = require("../models/Answer");
const ensureAuthenticated = require("../helpers/auth");
const Student = require("../models/Student");

// Functions

function upsert(values, qnId, studentId, tutorialId) {
  return Answer.findOne({
    where: { qnId: qnId, studentId: studentId, tutorialId: tutorialId },
  }).then(function (obj) {
    if (obj) {
      return obj.update(values);
    } else {
      return Answer.create(values);
    }
  });
}

router.get(
  "/tutorials/:id",
  ensureAuthenticated.ensureStudent,
  async function (req, res) {
    const check = await Tutorial.findByPk(req.params.id);
    if (check) {
      await Tutorial.findByPk(req.params.id, {
        include: { model: Question, include: { model: QnOption } },
        order: [[Question, "qnOrder", "ASC"]],
      }).then((data) => {
        res.render("student/tutorial", { data: data });
      });
    } else {
      res.render("404");
    }
  }
);

router.get("/tutorial", ensureAuthenticated.ensureStudent, (req, res) => {
  res.render("student/tutorial");
});

router.get("/content", ensureAuthenticated.ensureStudent, (req, res) => {
  Tutorial.findAll().then(async function (tutorials) {
    let status = [];
    await tutorials.forEach(async function (data) {
      await Answer.findOne({
        where: { studentId: req.user.id, tutorialId: data.id },
      }).then((result) => {
        if (result) {
          status.push({ id: data.id });
        }
      });
    });
    res.render("student/content", {
      data: { tutorials: tutorials, status: status },
    });
  });
});

router.get(
  "/result/:id",
  ensureAuthenticated.ensureStudent,
  async function (req, res) {
    const check = await Answer.findOne({
      where: { studentId: req.user.id, tutorialId: req.params.id },
    });
    if (check) {
      await Tutorial.findByPk(req.params.id, {
        include: [
          {
            model: Question,
            include: [
              {
                model: QnOption,
              },
              {
                model: Answer,
                where: { studentId: req.user.id },
              },
            ],
          },
        ],
      }).then(async function (data) {
        // console.log(JSON.stringify(data, null, 2));
        let status = "uncompleted";
        const score = await Answer.count({
          where: {
            studentId: req.user.id,
            input: null,
            tutorialId: req.params.id,
          },
        });
        await Answer.findOne({
          where: { studentId: req.user.id, tutorialId: req.params.id },
        }).then((result) => {
          if (result) {
            status = "completed";
          }
        });
        res.render("student/result", {
          data: { tut: data, score: score, status: status },
        });
      });
    } else {
      res.render("404");
    }
    // get total score
    const score1 = await Answer.count({
      where: {
        studentId: req.user.id,
        input: null,
      },
    });
    // update student score
    Student.findOne({
      where: { id: req.user.id }
    }).then(async function (student) {
      if (student.totalScore <= score1) {
        await Student.update(
          { totalScore: score1 },
          { where: { id: req.user.id } }
        )
      }
    })
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
        // console.log("QnId: " + qnId);
        // console.log("Answer: " + req.body[qnId]);
        await Question.findByPk(qnId).then(async function (i) {
          // console.log(JSON.stringify(i, null, 2));
          // console.log("Correct Answer: " + i.correctAns);
          let ans = i.correctAns;
          if (input == ans) {
            // console.log("Answer: " + input + " Correct Answer: " + ans);
            // Answer.create({
            //   ans,
            //   qnId,
            // });
            await upsert(
              {
                ans: ans,
                input: null,
                qnId: qnId,
                studentId: req.user.id,
                tutorialId: tutorialId,
              },
              qnId,
              req.user.id,
              tutorialId
            );
          } else if (input !== ans) {
            // console.log("Failed Answer: " + input + " Correct Answer: " + ans);
            // Answer.create({
            //   ans,
            //   input,
            //   qnId,
            // });
            await upsert(
              {
                ans: ans,
                input: input,
                qnId: qnId,
                studentId: req.user.id,
                tutorialId: tutorialId,
              },
              qnId,
              req.user.id,
              tutorialId
            );
          }
        });
      });
    } else {
      let qnId = ids;
      let input = req.body[qnId];
      await Question.findByPk(ids).then(async function (i) {
        let ans = i.correctAns;
        if (input == ans) {
          // console.log("Answer: " + input + " Correct Answer: " + ans);
          // Answer.create({
          //   ans,
          //   qnId,
          // });
          await upsert(
            {
              ans: ans,
              input: null,
              qnId: qnId,
              studentId: req.user.id,
              tutorialId: tutorialId,
            },
            qnId,
            req.user.id,
            tutorialId
          );
        } else if (input !== ans) {
          // console.log("Failed Answer: " + input + " Correct Answer: " + ans);
          // Answer.create({
          //   ans,
          //   input,
          //   qnId,
          // });
          await upsert(
            {
              ans: ans,
              input: input,
              qnId: qnId,
              studentId: req.user.id,
              tutorialId: tutorialId,
            },
            qnId,
            req.user.id,
            tutorialId
          );
        }
      });
    }
    // get total score
    const score1 = await Answer.count({
      where: {
        studentId: req.user.id,
        input: null,
      },
    });
    // update student score
    Student.findOne({
      where: { id: req.user.id }
    }).then(async function (student) {
      if (student.totalScore <= score1) {
        await Student.update(
          { totalScore: score1 },
          { where: { id: req.user.id } }
        )
      }
    })

    // Redirect to result page
    res.redirect("/student/result/" + tutorialId);
  }
);

module.exports = router;
