const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Card = require("../models/Card");

router.get('/', (req, res) => {
	const title = 'Video Jotter';
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

router.get('/studentProfile', (req, res) => {
    res.render('parent/studentProfile')
});


router.get('/studentProgress', (req, res) => {
    res.render('parent/studentProgress')
});


router.get('/tuitionFee', (req, res) => {
    Card.findAll({
        order: [['expiryDate', 'DESC']],
        raw: true
    })
    .then((cards) => {
        res.render('parent/tuitionFee', { cards });
    })
    .catch(err => console.log(err));
});


router.post('/tuitionFee', (req, res) => {
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
