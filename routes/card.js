const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const moment = require('moment');
const Card = require('../models/Card');
const ensureAuthenticated = require('../helpers/auth');


// get --> List of Cards
router.get('/listCard', ensureAuthenticated.ensureParent, (req, res) => {
    let currentMonth = moment(new Date()).format('YYYY-MM');
    Card.findAll({
        where: { parentTutorId: req.user.id },
        order: [['cardName', 'DESC']],
        raw: true
    })
        .then((cards) => {
            if (cards.length > 0) {
                cards.forEach(async function (card) {
                    let cardExpiry = moment(card.expiryDate).format('YYYY-MM');
                    if (currentMonth > cardExpiry) {        // check if card has expired
                        flashMessage(res, 'error', card.cardName + ' payment card has expired.' );
                        await Card.destroy({ where: { id: card.id } })
                    }
                })
            }
            res.render('card/listCard', { cards });
        })
        .catch(err => console.log(err));
});


// get --> Add Card
router.get('/addCard', ensureAuthenticated.ensureParent, async function (req, res) {                                      
    let isOk = true;
    const myCount = await Card.count();                         // check if COUNT(cards) >= 3
    console.log("Number of cards: " + myCount);                   
    if (myCount >= 3) {                                         // yes --> redirect to card/listCard
        flashMessage(res, 'error', 'Maximum number of cards');
        isOk = false;
    }
    if (!isOk) {
        Card.findAll({
            order: [['expiryDate', 'DESC']],
            raw: true
        })
            .then((cards) => {
                res.render('card/listCard', { cards });
            })
            .catch(err => console.log(err));
        return;
    }                       
    res.render('card/addCard');                                 // no --> render card/addCard
});


// post --> Add Card
router.post('/addCard', ensureAuthenticated.ensureParent,  (req, res) => {
    let cardName = req.body.cardName;
    let cardNo = req.body.cardNo.slice(0, 19);
    let expiryDate = moment(req.body.expiryDate, 'MM/YYYY');
    let ccv = req.body.ccv;
    let debitCredit = req.body.debitCredit;
    let parentTutorId = req.user.id;
    let isValid = true;
    if (cardNo.length < 13) {
        flashMessage(res, 'error', 'Card Number must contain 13 to 19 numbers (inclusive).');
        isValid = false;
    }
    if (ccv.length < 3) {
        flashMessage(res, 'error', 'CCV must contain 3 to 4 numbers (inclusive).');
        isValid = false;
    }
    if (!cardName || !cardNo || !ccv) {
        flashMessage(res, 'error', 'Please fill in the form to save payment card.');
        isValid = false;
    }
    if (isNaN(cardNo) || isNaN(ccv)) {
        flashMessage(res, 'error', 'Card Number/CCV must contain numbers only.');
        isValid = false;
    }
    if (!isValid) {
        res.render('card/addCard', {
            cardName, cardNo, ccv
        });
        return;
    }
    Card.create({ cardName, cardNo, expiryDate, ccv, debitCredit, parentTutorId })
        .then((card) => {
            console.log(card.toJSON());
            flashMessage(res, 'success', cardName + ' ' + debitCredit + ' card saved successfully');
            res.redirect('/card/listCard');
        })
        .catch(err => console.log(err))
});


// get --> Edit Card
router.get('/editCard/:id', ensureAuthenticated.ensureParent,  (req, res) => {
    Card.findByPk(req.params.id)
        .then((card) => {
            if (!card) {
                flashMessage(res, 'error', 'Payment Card not found');
                res.redirect('/card/listCard');
                return;
            }
            if (req.user.id != card.parentTutorId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/card/listCard');
                return;
            }
            res.render('card/editCard', { card });
        })
        .catch(err => console.log(err));
});


// post --> Edit Card
router.post('/editCard/:id', ensureAuthenticated.ensureParent,  (req, res) => {
    let cardName = req.body.cardName;
    let cardNo = req.body.cardNo.slice(0, 19);
    let expiryDate = moment(req.body.expiryDate, 'MM/YYYY');
    let ccv = req.body.ccv;
    let debitCredit = req.body.debitCredit;
    let isValid = true;
    if (cardNo.length < 13) {
        flashMessage(res, 'error', 'Card Number must contain 13 to 19 numbers (inclusive).');
        isValid = false;
    }
    if (ccv.length < 3) {
        flashMessage(res, 'error', 'CCV must contain 3 to 4 numbers (inclusive).');
        isValid = false;
    }
    if (!cardName || !cardNo || !ccv) {
        flashMessage(res, 'error', 'Please fill in the form to save payment card.');
        isValid = false;
    }
    if (isNaN(cardNo) || isNaN(ccv)) {
        flashMessage(res, 'error', 'Card Number/CCV must contain numbers only.');
        isValid = false;
    }
    if (!isValid) {
        res.render('card/addCard', {
            cardName, cardNo, expiryDate, ccv, debitCredit
        });
        return;
    }
    Card.update(
        {
            cardName, cardNo, expiryDate, ccv, debitCredit
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' payment card updated');
            flashMessage(res, 'success', cardName + ' ' + debitCredit + ' card updated successfully');
            res.redirect('/card/listCard');
        })
        .catch(err => console.log(err));
});


// get --> Delete Card
router.get('/deleteCard/:id', ensureAuthenticated.ensureParent, async function (req, res) {
    try {
        let card = await Card.findByPk(req.params.id);
        if (!card) {
            flashMessage(res, 'error', 'Payment Card not found');
            res.redirect('/card/listCard');
            return;
        }
        if (req.user.id != card.parentTutorId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/card/listCard');
            return;
        }
        let result = await Card.destroy({ where: { id: card.id } });
        console.log(result + ' Payment Card deleted');
        res.redirect('/card/listCard');
    }
    catch (err) {
        console.log(err);
    }
});


module.exports = router;