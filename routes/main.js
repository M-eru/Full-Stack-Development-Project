const express = require("express");
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const { route } = require("./tutor");


router.get('/', (req, res) => {
	const title = 'Tuition Academy';
	// renders views/index.handlebars, passing title as an object
	res.render('index', { title: title })
});

router.get("/404", (req, res) => {
	res.render("404");
})


router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';

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


module.exports = router;
