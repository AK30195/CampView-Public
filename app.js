if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverrride = require('method-override');
const customError = require('./utils/customError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const sanitizeV5 = require('./utils/mongoSanitizeV5');
const helmet = require('helmet');

// Router setup
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Database configuration
mongoose.connect(process.env.DATABASE_URL);

// Check for successful db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected.");
})

const app = express();
app.set('query parser', 'extended');

// Set ejs as view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));
app.use(methodOverrride('_method'));

const store = mongoStore.create({
    mongoUrl: (process.env.DATABASE_URL),
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});

store.on('error', function (e) {
    console.log('Session store error: ', e);
});

// Session & cookie configuration
const sessionConfig = {
    store,
    name: 'session_id',
    secret: process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
      //  secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// Authentication middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash functionality
app.use(flash());
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// Security poilicies ensure scripts, images etc. from trusted source
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfmhofkkc/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Middleware sends current page, used for active links in navbar
app.use((req, res, next) => {
  const path = req.path;

  if (path.startsWith('/campgrounds/new')) {
    res.locals.currentPage = 'campgrounds/new';
  } else if (path.startsWith('/campgrounds')) {
    res.locals.currentPage = 'campgrounds';
  } else if (path === '/') {
    res.locals.currentPage = 'home';
  } else {
    res.locals.currentPage = path.slice(1);
  }
  next();
});

// Home page route
app.get('/', (req, res) => {
    res.render("home");
});

// Router categories setup
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// Catch all for incorrect URLs
app.all(/(.*)/, (req, res, next) => {
    next(new customError('Page not found!', 404));
});

// Error Handler
app.use((err, req, res, next) => {
    const { message = 'Something went wrong!', statusCode = 500 } = err;
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on Port ${port}`)
});

