const mongoose = require("mongoose");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, check, validationResult } = require("express-validator");

// models
const User = mongoose.model("User");

// routes
router.post(
  "/login",
  body("email")
    .isEmail()
    .exists()
    .withMessage("Email is required and needs to be valid email"),
  body("password").exists().withMessage("Password is required"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    const user = await User.findOne({ email: req.body.email });
    // User.findOne({
    //   email: req.body.email,
    // }).then((user) => {
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      bcrypt.compare(
        req.body.password,
        user.passwordHash,
        function (err, result) {
          if (result) {
            let token = user.generateJWT();

            res.status(200).json({
              token,
              message: "Login Successfull",
              user: {
                name: user.name,
                email: user.email,
                id: user._id,
              },
            });
          } else {
            res.status(400).json({ message: "Authentication failed" });
          }
        }
      );
    // });
  }
);

router.post(
  "/register",
  body("name").exists().withMessage("Name is required"),
  body("email")
    .isEmail()
    .exists()
    .withMessage("Email is required and needs to be valid email"),
  body("password").exists().withMessage("Password is required"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    User.findOne({
      email: req.body.email,
    }).then((user) => {
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      let newUser = new User();
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.passwordHash = bcrypt.hashSync(req.body.password, 10);
      newUser.save().then((user) => {
        let token = user.generateJWT();
        res.status(200).json({
          token,
          message: "User created successfully",
          user: {
            name: user.name,
            email: user.email,
            id: user._id,
          },
        });
      });
    });
  }
);

module.exports = router;
