const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Card = require("../models/Card");
const Student = require('../models/Student');
const ParentTutor = require('../models/ParentTutor');
const Tutorial = require("../models/Tutorial");
const Answer = require("../models/Answer");
const Payment_Duration = require("../models/Payment_Duration");
const ensureAuthenticated = require('../helpers/auth');
const sequelize = require("sequelize");
const moment = require('moment');


// get --> studentProfile (not selected)
router.get('/studentProfile_select', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        console.log(students);
        res.render("parent/studentProfile_select", { students });
    })
});


// get --> studentProfile (selected)
router.get('/studentProfile/:id', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        Student.findByPk(req.params.id).then((student) => {
            if (!student) {
                flashMessage(res, 'error', 'Student not found');
                res.redirect('/studentProfile');
                return;
            }
            ParentTutor.findByPk(1).then((tutor) => {
                res.render("parent/studentProfile", { student, students, tutor });
            })
        })
    })
        .catch(err => console.log(err));
});


// get --> studentProgress (not selected)
router.get('/studentProgress_select', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        res.render('parent/studentProgress_select', { students });
    })
});


// get --> studentProgress (selected)
router.get('/studentProgress/:id', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        Tutorial.findAll().then((tutorials) => {
            Student.findByPk(req.params.id).then(async function (student) {
                if (!student) {
                    flashMessage(res, 'error', 'Student not found');
                    res.redirect('/studentProgress');
                    return;
                }
                let scoreList = {};
                tutorials.forEach(async function (tutorial) {
                    await Answer.count({
                        where: {
                            studentId: req.params.id,
                            input: null,
                            tutorialId: tutorial.id,
                        }
                    }).then((score) => {
                        var tmp = {"tutName": tutorial.tutName, "score": score};
                        scoreList[tutorial.tutName] = tmp;
                    })
                })
                res.render('parent/studentProgress', { students, tutorials, student, scoreList });
            })
        })
    })
        .catch(err => console.log(err));
});


// get --> tuitionFee (not selected)
router.get('/tuitionFee_select', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        console.log(students);
        res.render('parent/tuitionFee_select', { students });
    }).catch(err => console.log(err));
});


// get --> tuitionFee (selected)
router.get('/tuitionFee/:id', ensureAuthenticated.ensureParent, (req, res) => {
    let currentTime = moment(new Date()).format('YYYY-MM-DD');
    // get1 --> all cards
    Card.findAll({
        where: { parentTutorId: req.user.id },
        order: [['expiryDate', 'DESC']],
        raw: true
    })
        .then((cards) => {
            // get1 --> all students (leftNavbar)
            Student.findAll({
                include: { model: ParentTutor },
                where: { parentTutorId: req.user.id },
                order: [['name', 'ASC']]
            }).then((students) => {
                // get1 --> selected student
                Student.findByPk(req.params.id).then((student) => {
                    if (!student) {
                        flashMessage(res, 'error', 'Student not found');
                        res.redirect('/tuitionFee_select');
                        return;
                    }
                    // get1 --> duration of payment
                    Payment_Duration.findOne({
                        where: {studentId: student.id}
                    }).then((duration) => {
                        let myEndDate = moment(duration.endDate).format('YYYY-MM-DD');
                        // if exceed time limit, change info
                        if (currentTime == myEndDate) {
                            let startDate1 = duration.endDate;
                            let endDate1 = moment(startDate1).add(1, 'Y');
                            Payment_Duration.update({
                                startDate:startDate1, endDate:endDate1, payed: false
                            },
                            { where: {studentId: student.id} }).then((duration) => {
                                res.render("parent/tuitionFee", { cards, student, students, duration });
                            })
                        }
                        // else, render page normally
                        else {
                            res.render("parent/tuitionFee", { cards, student, students, duration });
                        }
                    });
                })
            })
        })
        .catch(err => console.log(err));
});


// post --> tuitionFee (selected)
router.post('/tuitionFee/:id', ensureAuthenticated.ensureParent, (req, res) => {
    var card_id = req.body.tuition_card;
    let isValid = true;
    if (!card_id) {
        flashMessage(res, 'error', 'No payment card selected.');
        isValid = false;
    }
    if (!isValid) {
        Card.findAll({
            order: [['expiryDate', 'DESC']],
            raw: true
        })
            .then((cards) => {
                res.render('parent/tuitionFee', { cards });
            })
            .catch(err => console.log(err));
        return;
    }
    Payment_Duration.update(
        {
            payed: true
        },
        { where: { studentId: req.params.id } }
    )
        .then((result) => {
            flashMessage(res, 'success', 'Payment complete!');
            res.redirect('/parent/tuitionFee/' + req.params.id);
        })
        .catch(err => console.log(err));
});

module.exports = router;
