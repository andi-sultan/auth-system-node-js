const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { check } = require("express-validator");

router.get("/", (req, res) => {
  //check if user is logged in
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  return res.redirect("/login");
});
// Login routes
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// Register routes
router.get("/register", authController.getRegister);
router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.postRegister
);

// Logout route
router.get("/logout", authController.logout);

// Email verification route
router.get("/verify-email/:token", authController.verifyEmail);

// Forgot password routes
router.get("/forgot-password", authController.getForgotPassword);
router.post("/forgot-password", authController.postForgotPassword);

// Reset password routes
router.get("/reset-password/:token", authController.getResetPassword);
router.post(
  "/reset-password/:token",
  [
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.postResetPassword
);

// Protected route example
router.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.user });
});

module.exports = router;
