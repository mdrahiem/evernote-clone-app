const express = require('express');
const dotenv =  require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const { execArgv } = require('process');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

// method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars helpers
const { formatDate, truncate, stripTags, editIcon, select } = require('./helpers/hbs');

// Handlebars
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', helpers: { formatDate, truncate, stripTags, editIcon, select } }));
app.set('view engine', 'hbs');

// Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function(req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories.routes'));

// const PORT = process.env.PORT || 3003;
app.listen(3003 , () => console.log(`server started in ${process.env.NODE_ENV} mode on 3003`));