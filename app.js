const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
const flash = require("connect-flash");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
const pgSession = require("connect-pg-simple")(session);
const pool = require("./config/database");

app.use(
  session({
    // Use connect-pg-simple to store session data in PostgreSQL
    store: new pgSession({
      pool: pool, // Database connection pool
      tableName: "user_sessions", // Name of the table to store sessions
    }),
    secret: process.env.SESSION_SECRET, // Secret key for signing the session ID cookie
    resave: false, // Prevents session from being saved back to the store if it wasn't modified
    saveUninitialized: false, // Don't save a session that is new and not modified
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration time set to 30 days
      httpOnly: true, // Prevents client-side access to the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    },
  })
);

// Flash middleware
app.use(flash());

// Import passport configuration
require('./config/passport-config');

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// After all other routes and middleware
app.use((req, res, next) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    url: req.url 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
