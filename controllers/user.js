const User = require('../models/user');

module.exports.renderRegForm = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/register');
};

module.exports.create = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to CampView');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    };
};

module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/login');
};

module.exports.login = async (req, res) => {
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    req.flash('success', 'Login successful!');
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};