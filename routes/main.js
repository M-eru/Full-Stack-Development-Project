const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Card = require("../models/Card");
const Student = require('../models/Student');
const ensureAuthenticated = require('../helpers/auth');
const ParentTutor = require("../models/ParentTutor");

router.get('/', (req, res) => {
	const title = 'Tuition Academy';
	// renders views/index.handlebars, passing title as an object
	res.render('index', { title: title })
});


router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';

	// req.flash('message', message);
	// req.flash('error', error);
	// req.flash('error', error2);

	flashMessage(res, 'success', message);
	flashMessage(res, 'info', message);
	flashMessage(res, 'error', error);
	flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);

	res.redirect('/about');
});

router.get("/", (req, res) => {
  const title = "Tuition Academy";
  res.render("index", { title });
});

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
