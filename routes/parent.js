const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Card = require("../models/Card");
const Student = require('../models/Student');
const ParentTutor = require('../models/ParentTutor');
const ensureAuthenticated = require('../helpers/auth');


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
        console.log(students);
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
        Student.findByPk(req.params.id).then((student) => {
            if (!student) {
                flashMessage(res, 'error', 'Student not found');
                res.redirect('/studentProgress');
                return;
            }
            res.render("parent/studentProgress", { student, students });
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
    // get all cards
    Card.findAll({
        where: { parentTutorId: req.user.id },
        order: [['expiryDate', 'DESC']],
        raw: true
    })
        .then((cards) => {
            // get all students (leftNavbar)
            Student.findAll({
                include: { model: ParentTutor },
                where: { parentTutorId: req.user.id },
                order: [['name', 'ASC']]
            }).then((students) => {
                // get selected student
                Student.findByPk(req.params.id).then((student) => {
                    if (!student) {
                        flashMessage(res, 'error', 'Student not found');
                        res.redirect('/tuitionFee_select');
                        return;
                    }
                    res.render("parent/tuitionFee", { cards, student, students });
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
    Student.update(
        {
            payed: true
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            flashMessage(res, 'success', 'Payment complete!');
            res.redirect('/parent/tuitionFee_select');
        })
        .catch(err => console.log(err));
});

module.exports = router;
