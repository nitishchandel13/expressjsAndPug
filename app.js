const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const config = require('./config/database')
const passport = require('passport')
mongoose.connect(config.database)
let db = mongoose.connection;

// Check connection
db.once('open', () => console.log('Connected to mongoDB'))

// Check for DB error
db.on('error', () => console.log(error))
// Init app
const app = express();

// Bring in models
let Article = require('./models/article');
const port = 3000

// Load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
      if(err) console.log(err)
      res.render('index', {
        title: 'Articles',
        articles
      })
    });
})

// Route Files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

// Server start
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
