"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./user"));
const group_1 = __importDefault(require("./group"));
const router = express_1.default.Router();
// routes
router.use("/user", user_1.default);
router.use("/group", group_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map