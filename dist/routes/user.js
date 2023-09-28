"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
const SALT_ROUNDS = 10;
// models
const User_1 = __importDefault(require("../models/User"));
// routes
router.post("/login", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .exists()
        .withMessage("Email is required and needs to be valid email"),
    (0, express_validator_1.body)("password").exists().withMessage("Password is required"),
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                errors: errors.array(),
            });
        }
        const user = yield User_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const passwordComparison = yield bcrypt_1.default.compare(req.body.password, user.passwordHash);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error,
        });
    }
}));
router.post("/register", [
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .exists()
        .withMessage("Email is required and needs to be valid email"),
    (0, express_validator_1.body)("password").exists().withMessage("Password is required"),
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                errors: errors.array(),
            });
        }
        const user = yield User_1.default.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User_1.default();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.passwordHash = bcrypt_1.default.hashSync(req.body.password, SALT_ROUNDS);
        yield newUser.save();
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error,
        });
    }
}));
exports.default = router;
//# sourceMappingURL=user.js.map