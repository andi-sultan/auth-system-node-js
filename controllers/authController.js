const User = require("../models/user");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const authController = {
  getLogin: (req, res) => {
    res.render("auth/login", { message: req.flash("error") });
  },

  postLogin: passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),

  getRegister: (req, res) => {
    res.render("auth/register");
  },

  async sendVerificationEmail(req, user) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link:\n\n
          http://${req.headers.host}/verify-email/${user.verification_token}\n\n
          If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
  },

  async postRegister(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("auth/register", { errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.create({ email, password });

      // Send verification email
      await authController.sendVerificationEmail(req, user);

      req.flash(
        "success",
        "Registration successful! Please check your email to verify your account."
      );
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      // Check for PostgreSQL duplicate key error
      if (err.code === "23505") {
        req.flash("error", "Email already registered.");
        return res.redirect("/register");
      }
      req.flash("error", "Registration failed. Please try again.");
      res.redirect("/register");
    }
  },

  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.redirect("/");
      }
      // Clear session cookie if needed
      req.session.destroy(() => {
        // connect.sid cookie is automatically created by express-session middleware (default name)
        res.clearCookie("connect.sid"); // The cookie name might be different if you customized it
        res.redirect("/login");
      });
    });
  },

  async verifyEmail(req, res) {
    try {
      const user = await User.verifyEmail(req.params.token);

      if (!user) {
        req.flash("error", "Invalid or expired verification token.");
        return res.redirect("/login");
      }

      req.flash("success", "Email verified successfully! You can now log in.");
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      req.flash("error", "Email verification failed.");
      res.redirect("/login");
    }
  },

  getForgotPassword: (req, res) => {
    res.render("auth/forgot-password");
  },

  async postForgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        req.flash("error", "No account with that email address exists.");
        return res.redirect("/forgot-password");
      }

      if (!user.verified) {
        req.flash(
          "error",
          `Please verify your email before resetting your password.
          Please check your email to verify your account.`
        );
        await authController.sendVerificationEmail(req, user);
        return res.redirect("/forgot-password");
      }

      // Create reset token
      const token = crypto.randomBytes(20).toString("hex");
      const expiry = Date.now() + 3600000; // 1 hour from now

      await User.setResetToken(email, token, new Date(expiry));

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: "Password Reset",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset-password/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.`,
      };

      await transporter.sendMail(mailOptions);

      req.flash("success", "An email has been sent with further instructions.");
      res.redirect("/forgot-password");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error sending reset email. Please try again.");
      res.redirect("/forgot-password");
    }
  },

  getResetPassword: (req, res) => {
    res.render("auth/reset-password", { token: req.params.token });
  },

  async postResetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("auth/reset-password", {
          token: req.params.token,
          errors: errors.array(),
        });
      }

      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("back");
      }

      const user = await User.resetPassword(req.params.token, password);

      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot-password");
      }

      req.flash(
        "success",
        "Password reset successfully! You can now log in with your new password."
      );
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error resetting password. Please try again.");
      res.redirect("back");
    }
  },
};

module.exports = authController;
