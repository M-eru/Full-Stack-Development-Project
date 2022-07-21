const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    flashMessage(res, "error", "Authentication failed. Redirected to homepage.");
    res.redirect('/');
};
module.exports = ensureAuthenticated;