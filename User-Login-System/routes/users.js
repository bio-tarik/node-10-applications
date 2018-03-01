var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: './uploads'
});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Register',
        "errors": null
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Register'
    });
});

router.post('/register', upload.single('profileimage'), function (req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var login = req.body.login;
    var password = req.body.password;
    var password2 = req.body.password2;
    var profileimage = '';

    if (req.file) {
        console.log('Uploading file...');
        profileimage = req.file.filename;
    }

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('login', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        console.log('Errors');
        res.render('register', {
            title: "Register",
            'errors': errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: login,
            password: password,
            profileimage: profileimage
        });
        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success', 'You are now registered and can login');

        res.location('/');
        res.redirect('/');
    }
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password'
}), function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
      console.log(id);
      
    User.getUserById(id, function(err, user) {
        console.log(user);
        
      done(err, user);
    });
  });

passport.use(new LocalStrategy((username, password, done) => {
    console.log(username);
    console.log(password);
    
    User.getUserByUsername(username, (err, user) => {
        console.log('user:' + user);
        
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Unknown user'});
        }

        User.comparePassword(password, user.password, (err, ismatch) => {
            if(err) return done(err);

            if (ismatch) {
                return done(null, user);
            } else{
                return done(null, false, {message: 'Invalid Password'});
            }
        });
    });
}));

module.exports = router;