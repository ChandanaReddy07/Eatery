const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");
// const { SECRET } = require('../config');

exports.signup = async (req, res) => {
  const { validationResult } = require("express-validator");

  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new User(req.body);

    // Save the user using async/await
    const savedUser = await user.save();

    // Send a response with the saved user
    res.json(savedUser);
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({
      error: "Failed to save user to the database",
    });
  }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
  
    // Validate the request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
    try {
      // Check if the user exists with the provided email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
  
      // Check if the provided password matches the stored password
      const isPasswordValid = await user.authenticate(password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // If authentication is successful, create a JWT token
      const token = jwt.sign({ _id: user._id }, 'fhashdghgshgdh', {
        expiresIn: '1h', // Set token expiration time
      });
  
      // Set the token as a cookie or in the response header (choose one)
      // Example with a cookie:
      res.cookie('token', token, {
        httpOnly: true, // Cookie cannot be accessed by JavaScript
        secure: true, // Use 'true' in production for HTTPS
      });
  
      // Send a success response with the token and user data
      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User Signout Sucess",
  });
};

// protectedRoutes
exports.isSignedIn = expressJwt.expressjwt({
  secret: "fhashdghgshgdh",
  userProperty: "auth",
  algorithms: ["HS256"],
});

// middleware custom

exports.isAuthenticated = (req, res, next) => {
  const checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(404).json({
      error: "ACESS denied",
    });
  }
  next();
};
