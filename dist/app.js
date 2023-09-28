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
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, mongoose_1.connect)(process.env.MONGODB_URI)
    .then(() => {
    // tslint:disable-next-line: no-console
    console.log("connected to db");
})
    .catch((error) => {
    // tslint:disable-next-line: no-console
    console.error("error connecting to db:", error);
});
const User_1 = __importDefault(require("./models/User"));
const GroupChat_1 = __importDefault(require("./models/GroupChat"));
const GroupParticipant_1 = __importDefault(require("./models/GroupParticipant"));
const routes_1 = __importDefault(require("./routes"));
app.use("/api", routes_1.default);
app.get("/", (req, res) => {
    res.status(200).send(`Chat App API `);
});
const server = app.listen(port || 3000, () => {
    // tslint:disable-next-line: no-console
    console.log("Listening on port " + port);
});
// socket.io instantiation
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
    },
});
// listen on every connection
io.on("connection", (socket) => {
    // tslint:disable-next-line: no-console
    console.log("New user connected");
    socket.on("setup", (groupData) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, groupId } = groupData;
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return;
        socket.join(groupId);
        let groupParticipant = yield GroupParticipant_1.default.findOne({
            group: groupId,
            user: decode.data.id,
        });
        if (!groupParticipant) {
            groupParticipant = new GroupParticipant_1.default();
            groupParticipant.group = groupId;
            groupParticipant.user = decode.data.id;
            groupParticipant.socketId = socket.id;
            yield groupParticipant.save();
        }
        else {
            groupParticipant.socketId = socket.id;
            yield groupParticipant.save();
        }
        socket.emit("connected");
        groupParticipant.user = yield User_1.default.findById(decode.data.id, "name");
        socket.in(groupId).emit("member joined", groupParticipant);
    }));
    socket.on("new message", (newMessage) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, group, message } = newMessage;
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return;
        const user = yield User_1.default.findById(decode.data.id, "name");
        if (!user)
            return;
        const chat = new GroupChat_1.default();
        chat.group = group;
        chat.user = user;
        chat.message = message;
        yield chat.save();
        io.in(group).emit("new message", chat);
    }));
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        const groupParticipant = yield GroupParticipant_1.default.findOneAndUpdate({ socketId: socket.id }, { isActive: false }, { new: true });
        if (groupParticipant) {
            groupParticipant.user = yield User_1.default.findById(groupParticipant.user, "name");
            io.in(String(groupParticipant.group)).emit("member left", groupParticipant);
        }
        // tslint:disable-next-line: no-console
        console.log("user disconnected");
    }));
});
//# sourceMappingURL=app.js.map