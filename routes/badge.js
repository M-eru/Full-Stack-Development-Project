const express = require('express');
const router = express.Router();
const moment = require('moment');
const Badge = require('../models/Badge');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/badges', ensureAuthenticated.ensureStudent, (req, res) => {
    Badge.findAll({
        // where: { userId: req.user.id },
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
    let posterURL = req.body.posterURL;
    // let icon = req.body.icon;
    // let userId = req.user.id;

    Badge.create(
        { badgename, points, color, posterURL }
    )
        .then((badge) => {
            console.log(badge.toJSON());
            res.redirect('/badge/badges');
        })
        .catch(err => console.log(err))
});

router.get('/deleteBadge/:id', ensureAuthenticated.ensureTutor, async function (req, res) {
    try {
        let badge = await Badge.findByPk(req.params.id);
        if (!badge) {
            flashMessage(res, 'error', 'Badge not found');
            res.redirect('/badge/badges');
            return;
        }
        // if (req.user.id != badge.userId) {
        // flashMessage(res, 'error', 'Unauthorised access');
        // res.redirect('/badge/badges', 303);
        // return;
        // }

        let result = await Badge.destroy({ where: { id: badge.id } });
        console.log(result + ' Badge deleted');
        res.redirect('/badge/badges');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/upload', (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/')) {
        fs.mkdirSync('./public/uploads/', {
            recursive:
                true
        });
    }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/uploads/${req.file.filename}`
            });
        }
    });
});

module.exports = router;