const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const Memorystore = require('memorystore')(session);
const path = require('path');
const pp = require('./lib/passport/passport');
const { scheduleEventDeactivation, scheduleBanDeactivation } = require('./lib/config/cronJobs');
const cors = require('cors');

// Socket.IO 설정
const http = require('http');
const server = http.createServer(app);
const { initSocket } = require('./lib/socket/socket');

// Socket.io 초기화
initSocket(server);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('c:\\goodbuyforadmin\\upload\\profile_thums\\'));
app.use(express.static('c:\\goodbuyforadmin\\upload\\event_images\\'));
app.use('/uploads/chat_images', express.static('c:\\goodbuy\\upload\\chat_images\\'));
app.use('/uploads/admin_chat_images', express.static('c:\\goodbuy\\upload\\admin_chat_images'));
app.use(express.json());

// session
const maxAge = 1000 * 60 * 30;
const sessionObj = {
    secret: 'green!@#$%^',
    resave: false, 
    saveUninitialized: false, 
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

const reportRouter = require('./routes/reportRouter');
app.use('/report', reportRouter);

const chatRouter = require('./routes/chatRouter');
app.use('/chat', chatRouter);

const statRouter = require('./routes/statRouter');
app.use('/stat', statRouter);

// scheduler
scheduleEventDeactivation();
scheduleBanDeactivation();

server.listen(3002, '0.0.0.0');