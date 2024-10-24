const shortid = require('shortid');
const DB = require('../db/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.passport = (app) => {

    let passport = require('passport');
    let LocalStrategy = require('passport-local').Strategy;
    let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) { 
        console.log('1. serializeUser: ', user);
        done(null, { A_ID: user.A_ID, A_NO: user.A_NO });
        
    });
    
    passport.deserializeUser(function(user, done) {
        console.log('3. deserializeUser: ', user);
        done(null, user);

    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'a_id',
            passwordField: 'a_pw',
        },
        function(username, password, done) {
            console.log('username of LocalStrategy: ', username);
            console.log('password of LocalStrategy: ', password);

            DB.query(`
                SELECT * FROM TBL_ADMIN WHERE A_ID = ?
            `,
            [username], 
            (error, user) => {

                if (error) {
                    return done(error);
                }

                if (user.length > 0) {
                    
                    if (bcrypt.compareSync(password, user[0].A_PW)) {
                        return done(null, user[0], {message: 'Welcome'});
                    } else {
                        return done(null, false, {message: 'INCORRECT ADMIN PW'});
                    }

                } else {
                    return done(null, false, {message: 'INCORRECT ADMIN ID'});

                }

            });

        }
    ));

    return passport;

}