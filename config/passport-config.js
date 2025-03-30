const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pool = require("./database");

// Use the Passport LocalStrategy to authenticate users
passport.use(
  new LocalStrategy(
    // Customize the field used for the username
    { usernameField: "email" },
    // The callback function to authenticate the user
    async (email, password, done) => {
      try {
        // Query the database to find the user with the given email
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        // If the user is not found, return an error message
        if (user.rows.length === 0) {
          return done(null, false, {
            message: "Incorrect email or password",
          });
        }

        // Compare the given password with the hashed password in the database
        const isValidPassword = await bcrypt.compare(
          password,
          user.rows[0].password
        );

        // If the passwords do not match, return an error message
        if (!isValidPassword) {
          return done(null, false, {
            message: "Incorrect email or password",
          });
        }

        // If the user is not verified, return an error message
        if (!user.rows[0].verified) {
          return done(null, false, {
            message: "Please verify your email first",
          });
        }

        // If all checks pass, return the user object
        return done(null, user.rows[0]);
      } catch (err) {
        // Catch any errors that may occur and pass them to the done callback
        return done(err);
      }
    }
  )
);

// Serialize the user object to the session
passport.serializeUser((user, done) => {
  // Only store the user ID in the session
  done(null, user.id);
});

// Deserialize the user object from the session
passport.deserializeUser(async (id, done) => {
  try {
    // Query the database to find the user with the given ID
    const user = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );

    // Return the user object
    done(null, user.rows[0]);
  } catch (err) {
    // Catch any errors that may occur and pass them to the done callback
    done(err);
  }
});

module.exports = passport;

