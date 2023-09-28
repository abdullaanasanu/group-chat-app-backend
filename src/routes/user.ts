import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";

const router = express.Router();
const SALT_ROUNDS = 10;

// models
import User from "../models/User";

// routes
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .exists()
      .withMessage("Email is required and needs to be valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          errors: errors.array(),
        });
      }
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const passwordComparison = await bcrypt.compare(
        req.body.password,
        user.passwordHash
      );
      if (!passwordComparison) {
        return res.status(400).json({ message: "Authentication failed" });
      }
      const token = user.generateJWT();
      res.status(200).json({
        token,
        message: "Login Successfull",
        user: {
          name: user.name,
          email: user.email,
          id: user._id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
  }
);

router.post(
  "/register",
  [
    body("name").exists().withMessage("Name is required"),
    body("email")
      .isEmail()
      .exists()
      .withMessage("Email is required and needs to be valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          errors: errors.array(),
        });
      }
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      const newUser = new User();
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.passwordHash = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
      await newUser.save();
      const token = newUser.generateJWT();
      res.status(200).json({
        token,
        message: "User created successfully",
        user: {
          name: newUser.name,
          email: newUser.email,
          id: newUser._id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
  }
);

export default router;
