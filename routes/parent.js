const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Card = require("../models/Card");
const Student = require('../models/Student');
const ensureAuthenticated = require('../helpers/auth');
const ParentTutor = require("../models/ParentTutor");


router.get('/studentProfile', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        console.log(students);
        res.render("parent/studentProfile", { students });
    })
});


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
            res.render("parent/studentProfile", { student, students });
        })
    })
        .catch(err => console.log(err));
});


router.get('/studentProgress', ensureAuthenticated.ensureParent, (req, res) => {
    Student.findAll({
        include: { model: ParentTutor },
        where: { parentTutorId: req.user.id },
        order: [['name', 'ASC']]
    }).then((students) => {
        console.log(students);
        res.render('parent/studentProgress', { students });
    })
});


router.get('/tuitionFee', ensureAuthenticated.ensureParent, (req, res) => {
    Card.findAll({
        where: { parentTutorId: req.user.id },
        order: [['expiryDate', 'DESC']],
        raw: true
    })
    .then((cards) => {
        Student.findAll({
            include: { model: ParentTutor },
            where: { parentTutorId: req.user.id },
            order: [['name', 'ASC']]
        }).then((students) => {
            console.log(students);
            res.render('parent/tuitionFee', { cards, students });
        })
    })
    .catch(err => console.log(err));
});


router.get('/tuitionFee/:id', ensureAuthenticated.ensureParent, (req, res) => {
    Card.findAll({
        where: { parentTutorId: req.user.id },
        order: [['expiryDate', 'DESC']],
        raw: true
    })
    .then((cards) => {
        Student.findAll({
            include: { model: ParentTutor },
            where: { parentTutorId: req.user.id },
            order: [['name', 'ASC']]
        }).then((students) => {
            Student.findByPk(req.params.id).then((student) => {
                if (!student) {
                    flashMessage(res, 'error', 'Student not found');
                    res.redirect('/tuitionFee');
                    return;
                }
                res.render("parent/tuitionFee", { cards, student, students });
            })
        })
    })
    .catch(err => console.log(err));
});


router.post('/tuitionFee', ensureAuthenticated.ensureParent, (req, res) => {
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
    flashMessage(res, 'success', 'Payment complete!');
    res.render('parent/tuitionFee');
});

module.exports = router;
