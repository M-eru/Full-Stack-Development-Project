const express = require('express');
const router = express.Router();
const moment = require('moment');
const Badge = require('../models/Badge');
const ensureAuthenticated = require('../helpers/auth');

router.get('/badges', ensureAuthenticated.ensureStudent, (req, res) => {
    Badge.findAll({
        where: { userId: req.user.id },
        order: [['points', 'DESC']],
        raw: true
    })
        .then((badges) => {
            res.render('tutor_badges/badges', { badges });
        })
        .catch(err => console.log(err));
});

router.get('/createbadge', ensureAuthenticated.ensureTutor, (req, res) => {
    res.render('tutor_badges/createbadge');
});

router.post('/createbadge', ensureAuthenticated.ensureTutor, (req, res) => {
    let badgename = req.body.badgename;
    let points = req.body.points;
    let color = req.body.color;
    // let icon = req.body.icon;
    let userId = req.user.id;

    Badge.create(
        { badgename, points, color, userId }
    )
        .then((badge) => {
            console.log(badge.toJSON());
            res.redirect('/badge/badges', 303);
        })
        .catch(err => console.log(err))
});

router.get('/deleteBadge/:id', ensureAuthenticated.ensureTutor, async function (req, res) {
    try {
        let badge = await Badge.findByPk(req.params.id);
        if (!badge) {
            flashMessage(res, 'error', 'Badge not found');
            res.redirect('/badge/badges', 303);
            return;
        }
        if (req.user.id != badge.userId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/badge/badges', 303);
            return;
        }

        let result = await Badge.destroy({ where: { id: badge.id } });
        console.log(result + ' Badge deleted');
        res.redirect('/badge/badges', 303);
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;