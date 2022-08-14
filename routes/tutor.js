const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const QnOption = require("../models/QnOption");
const QnType = require("../models/QnType");
const Tutorial = require("../models/Tutorial");
const Student = require("../models/Student");
const ParentTutor = require("../models/ParentTutor");
const flashMessage = require("../helpers/messenger");
const bcrypt = require("bcryptjs");
const ensureAuthenticated = require("../helpers/auth");
const Answer = require("../models/Answer");
const Payment_Duration = require("../models/Payment_Duration");

// Function
function upsert(values, qnId) {
  return QnOption.findOne({ where: { qnId: qnId } }).then(function (obj) {
    if (obj) {
      return obj.update(values);
    } else {
      return QnOption.create(values);
    }
  });
}

// Content Pages

router.get("/content", ensureAuthenticated.ensureTutor, (req, res) => {
  Tutorial.findAll().then((tutorials) => {
    res.render("tutor/content", { tutorials: tutorials });
  });
});

router.get(
  "/qns/:id",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    const check = await Tutorial.findByPk(req.params.id);
    if (check) {
      await Tutorial.findByPk(req.params.id, {
        include: { model: Question, include: { model: QnOption } },
        order: [[Question, "qnOrder", "ASC"]],
      }).then((data) => {
        // console.log(JSON.stringify(data, null, 2));
        res.render("tutor/qns", { data: data });
      });
    } else {
      res.render("404");
    }
  }
);

router.get(
  "/tutorials/:id",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    const check = await Tutorial.findByPk(req.params.id);
    if (check) {
      await Tutorial.findByPk(req.params.id, {
        include: { model: Question, include: { model: QnOption } },
        order: [[Question, "qnOrder", "ASC"]],
      }).then((data) => {
        // console.log(JSON.stringify(data, null, 2));
        res.render("tutor/preview", { data: data });
      });
    } else {
      res.render("404");
    }
  }
);

router.get("/preview", ensureAuthenticated.ensureTutor, (req, res) => {
  res.render("tutor/preview");
});

// Question Forms
router.get("/mcq/:id", ensureAuthenticated.ensureTutor, (req, res) => {
  res.render("tutor/mcq", { id: req.params.id });
});

router.get("/oe/:id", ensureAuthenticated.ensureTutor, (req, res) => {
  res.render("tutor/oe", { id: req.params.id });
});

// Edit Forms
router.get(
  "/editMcq/:id",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    const check = await Question.findByPk(req.params.id);
    if (check) {
      await Question.findByPk(req.params.id, {
        include: { model: QnOption, required: true },
      }).then((question) => {
        res.render("tutor/editMcq", { question });
      });
    } else {
      res.render("404");
    }
  }
);

router.get(
  "/editOe/:id",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    const check = await Question.findByPk(req.params.id);
    if (check) {
      await Question.findByPk(req.params.id).then((question) => {
        res.render("tutor/editOe", { question });
      });
    } else {
      res.render("404");
    }
  }
);

// Delete Questions
router.get(
  "/deleteMcq/:id?",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    let result = await Question.destroy({ where: { id: req.params.id } });
    console.log(result + " question deleted.");
    res.redirect("/tutor/qns/" + req.query.tutId);
  }
);

router.get(
  "/deleteOe/:id?",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    let result = await Question.destroy({ where: { id: req.params.id } });
    console.log(result + " question deleted.");
    res.redirect("/tutor/qns/" + req.query.tutId);
  }
);

router.get(
  "/deleteTut/:id",
  ensureAuthenticated.ensureTutor,
  async function (req, res) {
    let result = await Tutorial.destroy({ where: { id: req.params.id } });
    console.log(result + " tutorial deleted.");
    res.redirect("/tutor/content");
  }
);

// Get parent details (Yee Jin)
router.get("/parent_details", ensureAuthenticated.ensureTutor, (req, res) => {
  Student.findAll({
    include: { model: ParentTutor },
    order: [["admno", "ASC"]],
  }).then(async function (students) {
    let studentList = {};
    students.forEach((student) => {
      Payment_Duration.findOne({
        where: {studentId: student.id}
      }).then((duration) => {
        var tmp = {
          "admno":student.admno, 
          "parent":student.parentTutorId ? student.parentTutor.name : "-", 
          "startDate": duration.startDate, "endDate": duration.endDate, 
          "payed": duration.payed 
        }
        studentList[student.name] = tmp;
      })
    })
    res.render("tutor/parent_details", { studentList });
  });
});

// Posts
router.post("/content", ensureAuthenticated.ensureTutor, (req, res) => {
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

router.post("/qnSubmit", ensureAuthenticated.ensureTutor, (req, res) => {
  let qnType = req.body.qnType;
  if (qnType == "Multiple Choice") {
    res.redirect("/tutor/mcq/" + req.body.id);
  } else if (qnType == "Open Ended") {
    res.redirect("/tutor/oe/" + req.body.id);
  }
});

router.post("/tutSubmit", ensureAuthenticated.ensureTutor, (req, res) => {
  flashMessage(res, "success", "Tutorial has been updated");
  res.redirect("/tutor/content");
});

router.post("/mcq", ensureAuthenticated.ensureTutor, async function (req, res) {
  let qnOrder = req.body.qnOrder;
  let question = req.body.qn;
  let ans1 = req.body.ans1;
  let ans2 = req.body.ans2;
  let ans3 = req.body.ans3;
  let ans4 = req.body.ans4;
  let correctAns = req.body.correctAns;
  let qnTypeId = 1;
  let tutorialId = req.body.id;
  const qnCheck = await Question.findOne({
    where: { qnOrder: req.body.qnOrder, tutorialId: tutorialId },
  });
  if (qnCheck) {
    await Question.update(
      {
        question,
        correctAns,
        qnTypeId,
      },
      { where: { qnOrder: req.body.qnOrder, tutorialId: tutorialId } }
    )
      .then(async function (question) {
        console.log(question[0] + " question updated.");
        upsert(
          { ans1: ans1, ans2: ans2, ans3: ans3, ans4: ans4, qnId: qnCheck.id },
          qnCheck.id
        );
        await Answer.destroy({ where: { tutorialId: tutorialId } })
          .then((options) => {
            flashMessage(res, "success", "Multiple choice question updated.");
            res.redirect("/tutor/qns/" + tutorialId);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  } else {
    await Question.create({
      qnOrder,
      question,
      correctAns,
      qnTypeId,
      tutorialId,
    })
      .then(async function (question) {
        console.log(question.toJSON());
        qnId = question.id;
        await QnOption.create({
          ans1,
          ans2,
          ans3,
          ans4,
          qnId,
        });
        await Answer.destroy({ where: { tutorialId: tutorialId } })
          .then((options) => {
            flashMessage(res, "success", "Multiple choice question created.");
            res.redirect("/tutor/qns/" + tutorialId);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
});

router.post("/oe", ensureAuthenticated.ensureTutor, async function (req, res) {
  let qnOrder = req.body.qnOrder;
  let question = req.body.qn;
  let correctAns = req.body.correctAns;
  let qnTypeId = 2;
  let tutorialId = req.body.id;

  const qnCheck = await Question.findOne({
    where: { qnOrder: req.body.qnOrder, tutorialId: tutorialId },
  });

  if (qnCheck) {
    await Question.update(
      {
        question,
        correctAns,
        qnTypeId,
      },
      { where: { qnOrder: req.body.qnOrder, tutorialId: tutorialId } }
    )
      .then(async function (question) {
        await QnOption.destroy({ where: { qnId: qnCheck.id } });
        await Answer.destroy({ where: { tutorialId: tutorialId } });
        flashMessage(res, "success", "Open ended question updated.");
        res.redirect("/tutor/qns/" + tutorialId);
      })
      .catch((err) => console.log(err));
  } else {
    await Question.create({
      qnOrder,
      question,
      correctAns,
      qnTypeId,
      tutorialId,
    })
      .then(async function (question) {
        console.log(question.toJSON());
        await Answer.destroy({ where: { tutorialId: tutorialId } });
        flashMessage(res, "success", "Open ended question created.");
        res.redirect("/tutor/qns/" + tutorialId);
      })
      .catch((err) => console.log(err));
  }
});

router.post("/editMcq/:id", ensureAuthenticated.ensureTutor, (req, res) => {
  let question = req.body.qn;
  let ans1 = req.body.ans1;
  let ans2 = req.body.ans2;
  let ans3 = req.body.ans3;
  let ans4 = req.body.ans4;
  let correctAns = req.body.correctAns;
  let tutorialId = req.body.tutId;

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
        .then(async function (options) {
          console.log(options[0] + " question options updated.");
          await Answer.destroy({ where: { tutorialId: tutorialId } });
          flashMessage(res, "success", "Multiple choice question updated.");
          res.redirect("/tutor/qns/" + tutorialId);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/editOe/:id", ensureAuthenticated.ensureTutor, (req, res) => {
  let question = req.body.qn;
  let correctAns = req.body.correctAns;
  let tutorialId = req.body.tutId;

  Question.update(
    {
      question,
      correctAns,
    },
    { where: { id: req.params.id } }
  )
    .then(async function (question) {
      console.log(question[0] + " question updated.");
      await Answer.destroy({ where: { tutorialId: tutorialId } });
      flashMessage(res, "success", "Open ended question updated.");
      res.redirect("/tutor/qns/" + tutorialId);
    })
    .catch((err) => console.log(err));
});

// Zi Kang's corner
router.get("/search-student", ensureAuthenticated.ensureTutor, async (req, res) => {
  let student = await Student.findByPk(req.query.id);
  res.render("tutor/searchStudent", { student });
});

router.get("/update-student", ensureAuthenticated.ensureTutor, (req, res) => {
  res.redirect("/tutor/search-student");
});

router.post("/search-student", async function (req, res) {
  let student = await Student.findOne({ where: { admno: req.body.admno } })
  if (!student) {
    flashMessage(res, "error", "No student with matching admin number found")
  }
  res.render("tutor/searchStudent", { student });
});

router.post("/update-student", async function (req, res) {
  let { stdId, name, admno, password, cpassword, status } = req.body;

  let isValid = true;

  if (!(admno.charAt(0) == "1")) {
    flashMessage(res, "error", "Admin no. has to start with 1");
    isValid = false;
  }
  
  if (password || cpassword) {
    if (password.length < 6) {
      flashMessage(res, "error", "New password must be at least 6 characters");
      isValid = false;
    }

    if (password != cpassword) {
      flashMessage(res, "error", "Passwords do not match");
      isValid = false;
    }
  }

  if (!isValid) {
    res.redirect("/tutor/search-student" + '?id=' + stdId);
    return;
  }

  if (password || cpassword) {
    Student.update(
      { name: name, admno: admno, password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)), status: status },
      { where: { id: stdId } })
      .then((result) => {
          console.log('Student Id: ' + result[0] + ' has been updated (password changed)');
      })
      .catch(err => console.log(err));
  }
  else {
    Student.update(
      { name: name, admno: admno, status: status },
      { where: { id: stdId } })
      .then((result) => {
          console.log('Student Id: ' + result[0] + ' has been updated');
      })
      .catch(err => console.log(err));
  }

  flashMessage(res, 'success', 'The details of student ' + admno + ' has been updated successfully');
  console.log('Redirecting to /tutor/search-student')
  res.redirect('/tutor/search-student')
});

module.exports = router;
