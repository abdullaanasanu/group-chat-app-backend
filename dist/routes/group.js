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
// import bcrypt from "bcrypt";
const auth_1 = require("../utils/auth");
const router = express_1.default.Router();
// models
const Group_1 = __importDefault(require("../models/Group"));
const GroupParticipant_1 = __importDefault(require("../models/GroupParticipant"));
const GroupChat_1 = __importDefault(require("../models/GroupChat"));
// routes
router.post("/create", [(0, express_validator_1.body)("name").exists().withMessage("Name is required"), auth_1.userAuth], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errors: errors.array(),
        });
    }
    const group = new Group_1.default();
    group.name = req.body.name;
    yield group.save();
    return res.status(200).json({
        success: true,
        message: "Group created successfully",
        group,
    });
}));
router.get("/", auth_1.userAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let groups = yield Group_1.default.find().sort({ _id: -1 }).lean();
        groups = yield Promise.all(groups.map((group) => __awaiter(void 0, void 0, void 0, function* () {
            group.totalParticipants = yield GroupParticipant_1.default.countDocuments({
                group: group._id,
                isActive: true,
            });
            return group;
        })));
        return res.status(200).json({
            success: true,
            groups,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err,
        });
    }
}));
router.get("/:id", auth_1.userAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = yield Group_1.default.findById(req.params.id).lean();
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }
        group.participants = yield GroupParticipant_1.default.find({
            group: group._id,
            isActive: true,
        })
            .populate("user", "name")
            .sort({ updatedAt: -1 })
            .lean();
        group.chat = yield GroupChat_1.default.find({ group: group._id })
            .populate("user", "name")
            .sort({ _id: 1 })
            .lean();
        return res.status(200).json({
            success: true,
            group,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err,
        });
    }
}));
exports.default = router;
//# sourceMappingURL=group.js.map