const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const flashMessage = require('../helpers/messenger');
const bcrypt = require("bcryptjs");
const ensureAuthenticated = require('../helpers/auth');


// function = check if char is an alphabet
function isCharacterALetter(char) {
    return (/[a-zA-Z]/).test(char)
}


// get --> Add Children
router.get('/addChildren', ensureAuthenticated.ensureParent, (req, res) => {
    res.render('children/addChildren');
});


// post --> Add Children
router.post('/addChildren', ensureAuthenticated.ensureParent, async function (req, res) {

    // get info from submitted form
    var admNo = req.body.admNo;
    var childPsd = req.body.childPsd;
    let parentId = req.user.id;
    let isValid = true;

    // check --> Admin Number [length = 7], [1st 6 characters are numbers], [last character is a letter]
    // multiple Admin Numbers
    if (Array.isArray(admNo) == true) {
        for (let i = 0; i < admNo.length; i++) {
            if (admNo[i].length != 7 || isNaN(admNo[i].substr(0, 6)) == true || isCharacterALetter(admNo[i].substr(-1)) == false) {
                flashMessage(res, 'error', 'Student admin number must contain exactly 6 numbers and 1 letter.');
                isValid = false;
                break;
            }
        }
    }
    // one Admin Number
    else {
        if (admNo.length != 7 || isNaN(admNo.substr(0, 6)) == true || isCharacterALetter(admNo.substr(-1)) == false) {
            flashMessage(res, 'error', 'Student admin number must contain 6 numbers and 1 letter exactly.');
            isValid = false;
        }
    }
    
    // check --> Password is filled
    // multiple Password
    if (Array.isArray(childPsd) == true) {
        for (let i = 0; i < childPsd.length; i++) {
            if (childPsd[i].length < 6) {
                flashMessage(res, 'error', 'Password should be at least 6 characters.');
                isValid = false;
                break;
            }
        }
    }
    // one Password
    else {
        if (childPsd.length < 6) {
            flashMessage(res, 'error', 'Password should be at least 6 characters.');
            isValid = false;
        }
    }

    // isValid = false
    if (!isValid) {
        res.render("children/addChildren", { admNo });
        return;
    }

    // check --> student can be found
    try {
        if (Array.isArray(admNo) == true) {
            for (let i = 0; i < admNo.length; i++) {
                // find student
                let student = await Student.findOne({ where: { admno: admNo[i] } });

                // Student not found
                if (!student) {
                    flashMessage(res, "error", admNo[i] + " cannot be found.");
                    res.render("children/addChildren", { admNo });
                    return;
                }
                
                // compare Password
                var isMatch = bcrypt.compareSync(childPsd[i], student.password);

                // Password not matching
                if (!isMatch) {
                    flashMessage(res, "error", admNo[i] + " cannot be found.");
                    res.render("children/addChildren", { admNo });
                    return;
                }

                if (student.parentTutorId == null || student.parentTutorId == parentId) {
                    Student.update(
                        { parentTutorId: parentId },
                        { where: {admno: admNo[i]} }
                    );
                }
                else {
                    flashMessage(res, "error", admNo[i] + " has been assigned.");
                    res.render("children/addChildren", { admNo });
                    return;
                }
                
            }
        }
        else {
            // find student
            let student = await Student.findOne({ where: { admno: admNo } });

            // Student not found
            if (!student) {
                flashMessage(res, "error", admNo + " cannot be found.");
                res.render("children/addChildren", { admNo });
                return;
            }

            // compare Password
            var isMatch = bcrypt.compareSync(childPsd, student.password);

            // Password not matching
            if (!isMatch) {
                flashMessage(res, "error", admNo + " cannot be found.");
                res.render("children/addChildren", { admNo });
                return;
            }

            if (student.parentTutorId == null || student.parentTutorId == parentId) {
                Student.update(
                    { parentTutorId: parentId },
                    { where: { admno: admNo}}
                );
            } else {
                flashMessage(res, "error", admNo + " has been assigned.");
                res.render("children/addChildren", { admNo });
                return;
            }
        }
    } 
    catch (err) {
        console.log(err);
    }

    flashMessage(res, "success", admNo + " assigned to parent");
    res.redirect("/parent/studentProfile_select");
});


module.exports = router;