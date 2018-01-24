var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
global.appRoot = path.resolve(__dirname);

var cors = require('cors')
const session = require('express-session');
var flash = require('connect-flash');
var fetch = require('node-fetch');

const mongoose = require('./libs/mongoose-connection')();

var app = express();
app.use(cors());

//session:
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'ssshhhhh'
}));

//Create mongoDb connection
mongoose.connection.on('openUri', () => {
    console.log("connection opened");
});

mongoose.connection.on('error', function(err) {
    console.log(err);
    console.log('Could not connect to mongo server!');
});

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 1000000
}));

app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');


// all environments
app.set('view engine', 'ejs');

//app.set('socketio', io);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Declearation of constant
global.globalConsTant = require('./Constants/constant');

//Admin Panel
//var users = require(appRoot + '/routes/users');

var notification = require(appRoot + '/push_notification');
app.get('/send_notification', notification.send_notification);
app.post('/testNotification', notification.testNotification);

app.get('/load_me',function(req,res){
    res.render('admin/registration');
})

require(appRoot + '/routes/admin/index')(app);
require(appRoot + '/routes/admin/blogs')(app);
require(appRoot + '/routes/admin/patients')(app);
require(appRoot + '/routes/admin/doctors')(app);
require(appRoot + '/routes/admin/problems')(app);
require(appRoot + '/routes/admin/medications')(app);
require(appRoot + '/routes/admin/articles')(app);
require(appRoot + '/routes/admin/hospitals')(app);
require(appRoot + '/routes/admin/pharmacy')(app);
require(appRoot + '/routes/admin/cases')(app);
require(appRoot + '/routes/admin/prices')(app);
require(appRoot + '/routes/admin/bookmarks')(app);
require(appRoot + '/routes/admin/search')(app);
require(appRoot + '/routes/admin/userSession')(app);
require(appRoot + '/routes/admin/labs_diagnostic')(app);
require(appRoot + '/routes/admin/PrimaryDiagnosys')(app);
require(appRoot + '/routes/admin/feedback')(app);
require(appRoot + '/routes/admin/limitations')(app);

//Users
var index = require('./routes/user/index');
var users = require('./routes/user/users');
var familyhistory = require('./routes/user/familyHistory');
var aboutOpinion = require('./routes/user/aboutOpinion');
var termsCondition = require('./routes/user/termsCondition');
var cases = require('./routes/user/case');
var blogs = require('./routes/user/blogs');
var doctorOpinion = require('./routes/user/doctorOpinion');
var bookmark = require('./routes/user/bookmarks');
var caseQuery = require('./routes/user/caseQueryAnswers');
var price = require('./routes/user/priceOptions');
var article = require('./routes/user/articles');
var primeryDignosis = require('./routes/user/primeryDignosis');
var search = require('./routes/user/search');
var like = require('./routes/user/likes');
var comment = require('./routes/user/comments');
var userSession = require('./routes/user/userSession');
var deleting = require('./routes/user/deleting');
var rating = require('./routes/user/rating');

app.use('/', index);
app.use('/users', users);
app.use('/api/familyHistory', familyhistory);
app.use('/api/getAboutOpinion', aboutOpinion);
app.use('/api/getTermsConditions', termsCondition);
app.use('/api/case', cases);
app.use('/api/blogs', blogs);
app.use('/api/doctorOpinion', doctorOpinion);
app.use('/api/bookmark', bookmark);
app.use('/api/caseQuery', caseQuery);
app.use('/api/priceOptions', price);
app.use('/api/articles', article);
app.use('/api/primeryDignosis', primeryDignosis);
app.use('/api/search', search);
app.use('/api/like', like);
app.use('/api/comment', comment);
app.use('/api/userSession',userSession);
app.use('/api/deleting',deleting);
app.use('/api/rating',rating);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;