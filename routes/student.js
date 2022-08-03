const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const Tutorial = require("../models/Tutorial");
const Answer = require("../models/Answer");
const Result = require("../models/Result");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/tutorials/:id", (req, res) => {
  Tutorial.findByPk(req.params.id, {
    include: { model: Question, include: { model: QnOption } },
    order: [[Question, "qnOrder", "ASC"]],
  }).then((data) => {
    res.render("student/tutorial", { data: data });
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

router.get("/result/:id", (req, res) => {
  Tutorial.findByPk(req.params.id, {
    include: [
      { model: Question, include: [QnOption, Answer] },
      { model: Result }, //, where: { id: 19 } }, WHERE studentId
    ],
  }).then((data) => {
    // console.log(JSON.stringify(data, null, 2));
    res.render("student/result", { data: data });
  });
});

// Posts

router.post("/tutorials/:id", async function (req, res) {
  // Tutorial ID, Score and qnId Array
  let tutorialId = req.body.tutId;
  let ids = req.body.id;
  let score = 0;
  let status = "true";

  Result.create({
    //Tried adding await
    status,
    score,
    tutorialId,
  });
  // console.log("Tutorial: " + tutorialId);
  // console.log("Qn: " + ids);

  // Question Answers
  if (Array.isArray(req.body.id) == true) {
    console.log("52");
    ids.forEach(async function (qnId) {
      console.log("54");
      let input = req.body[qnId];
      // console.log("Answer: " + req.body[item]);
      await Question.findByPk(qnId).then((i) => {
        // console.log(JSON.stringify(i, null, 2));
        // console.log("Correct Answer: " + i.correctAns);
        let ans = i.correctAns;
        if (input == ans) {
          console.log("Answer: " + input + " Correct Answer: " + ans);
          score += 1;
          Result.update(
            {
              //Tried adding await
              score,
            },
            { where: { tutorialId: tutorialId } }
          );
          Answer.create({
            ans,
            qnId,
          });
        } else if (input !== ans) {
          console.log("Failed Answer: " + input + " Correct Answer: " + ans);
          Answer.create({
            ans,
            input,
            qnId,
          });
        }
      });
      await sleep(2000);
    });
  } else {
    let qnId = ids;
    let input = req.body[qnId];
    await Question.findByPk(ids).then((i) => {
      let ans = i.correctAns;
      if (input == ans) {
        console.log("Answer: " + input + " Correct Answer: " + ans);
        score += 1;
        Result.update(
          {
            //Tried adding await
            score,
          },
          { where: { tutorialId: tutorialId } }
        );
        Answer.create({
          ans,
          qnId,
        });
      } else if (input !== ans) {
        console.log("Failed Answer: " + input + " Correct Answer: " + ans);
        Answer.create({
          ans,
          input,
          qnId,
        });
      }
    });
  }

  // Adding student's results into database
  // let status = "true";
  console.log("Score: " + score);
  // Result.create({
  //   Tried adding await
  //   status,
  //   score,
  //   tutorialId,
  // });

  // Redirect to result page
  res.redirect("/student/result/" + tutorialId);
});

module.exports = router;
