const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const Memorystore = require('memorystore')(session);
const path = require('path');
const pp = require('./lib/passport/passport');

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('c:\\goodbuyforadmin\\upload\\profile_thums\\'));
app.use(express.static('c:\\goodbuyforadmin\\upload\\event_images\\'));

// session
const maxAge = 1000 * 60 * 30;
const sessionObj = {
    secret: 'green!@#$%^',
    resave: false, 
    saveUninitialized: true, 
    store: new Memorystore({checkPeriod: maxAge}),
    cookie: {
        maxAge: maxAge,
    }
};
app.use(session(sessionObj));

// passport START
let passport = pp.passport(app);
app.post('/admin/sign_in_confirm', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/admin/sign_in_form?errMsg=INCORRECT ADMIN ID OR PW',
}));

// view template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// routing
app.get('/', (req, res) => {
    console.log('/');
    res.redirect('/home');

});


// router
const homeRouter = require('./routes/homeRouter');
app.use('/home', homeRouter);

const adminRouter = require('./routes/adminRouter');
app.use('/admin', adminRouter);

const eventRouter = require('./routes/eventRouter');
app.use('/event', eventRouter);

app.listen(3002);