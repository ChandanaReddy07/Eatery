const express = require("express");
const router = express.Router();
// const passport = require('passport');
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { signup, signin } = require("../controller/auth");
const { check, validationResult } = require('express-validator');
// User registration
router.post(
  "/register",
  [check("email", "Enter a valid email address").isEmail()],
  signup
);

// User login
router.post("/login", [check("email", "Email is required").isEmail()],signin);

module.exports = router;
