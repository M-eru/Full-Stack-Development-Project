const express = require('express');
const router = express.Router();
const moment = require('moment');
const Badge = require('../models/Badge');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const ParentTutor = require('../models/ParentTutor');
const Answer = require('../models/Answer');

router.get('/badges', ensureAuthenticated.ensureTutor, (req, res) => {
    Badge.findAll({
        where: { parentTutorId: req.user.id },
        order: [['points', 'ASC']],
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

// router.post('/createbadge', ensureAuthenticated.ensureTutor, (req, res) => {
// let badgename = req.body.badgename;
// let points = req.body.points;
// let color = req.body.color;
// let posterURL = req.body.posterURL;
// let icon = req.body.icon;
// let userId = req.user.id;
// 
// Badge.create(
// { badgename, points, color, posterURL }
// )
// .then((badge) => {
// console.log(badge.toJSON());
// res.redirect('/badge/badges');
// })
// .catch(err => console.log(err))
// });

router.post('/createbadge', ensureAuthenticated.ensureTutor, async function (req, res) {
    let badgename = req.body.badgename;
    let points = req.body.points;
    let color = req.body.color;
    let posterURL = req.body.posterURL;
    // let userId = req.user.id;
    try {
        let badge = await Badge.findOne({ where: { badgename: badgename } });
        if (badge) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', badgename + ' already exists');
            res.render('tutor_badges/createbadge');
        }
        else {
            Badge.create(
                { badgename, points, color, posterURL, parentTutorId:1 }
            )
                .then((badge) => {
                    console.log(badge.toJSON());
                    res.redirect('/badge/badges');
                })
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/editBadge/:id', ensureAuthenticated.ensureTutor, (req, res) => {
    Badge.findByPk(req.params.id)
        .then((badge) => {
            if (!badge) {
                flashMessage(res, 'error', 'Badge not found');
                res.redirect('/badge/badges');
                return;
            }
            res.render('tutor_badges/editbadge', { badge });
        })
        .catch(err => console.log(err));
});

router.post('/editbadge/:id', ensureAuthenticated.ensureTutor, (req, res) => {
    let badgename = req.body.badgename;
    let points = req.body.points;
    let color = req.body.color;
    let posterURL = req.body.posterURL;
    Badge.update(
        {
            badgename, points, color, posterURL
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' Badge updated');
            res.redirect('/badge/badges');
        })
        .catch(err => console.log(err));
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
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, {
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
                file: `/uploads/${req.user.id}/${req.file.filename}`
            });
        }
    });
});

// StudentSide

router.get('/badge', ensureAuthenticated.ensureStudent, async function(req, res) {
    const score = await Answer.count({
        where: {
          studentId: req.user.id,
          input: null,
        },
      });
        console.log(score);
    Badge.findAll({
        where: { studentId: req.user.id },
        order: [['points', 'ASC']],
        raw: true
    })
        .then((badges) => {
            res.render('student/badge', { badges });
        })
        .catch(err => console.log(err));
});

module.exports = router;