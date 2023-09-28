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
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
function getTokenFromHeader(req) {
    if (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
}
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = getTokenFromHeader(req);
        if (!token)
            return next({ status: 401, message: " No Token Found " });
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return next({ status: 401, message: " Invalid Token " });
        const user = yield User_1.default.findOne({
            _id: decode.data.id,
            isBlocked: false,
        });
        if (!user)
            return next({ status: 401, message: " Unauthorised Access " });
        req.payload = token;
        req.user = user;
        next();
    }
    catch (err) {
        next({ status: 401, message: err });
    }
});
exports.userAuth = userAuth;
// export default auth;
//# sourceMappingURL=auth.js.map