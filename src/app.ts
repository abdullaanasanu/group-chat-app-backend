import express, { Application, Request, Response } from "express";
import cors from "cors";
import { connect } from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Server } from "socket.io";

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connect(process.env.MONGODB_URI)
  .then(() => {
    // tslint:disable-next-line: no-console
    console.log("connected to db");
  })
  .catch((error) => {
    // tslint:disable-next-line: no-console
    console.error("error connecting to db:", error);
  });

import User from "./models/User";
import Group from "./models/Group";
import GroupChat from "./models/GroupChat";
import GroupParticipant from "./models/GroupParticipant";

import routes from "./routes";

app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send(`Chat App API `);
});

const server = app.listen(port || 3000, () => {
  // tslint:disable-next-line: no-console
  console.log("Listening on port " + port);
});

// socket.io instantiation
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

// listen on every connection
io.on("connection", (socket: any) => {
  // tslint:disable-next-line: no-console
  console.log("New user connected");

  socket.on("setup", async (groupData: { token: string; groupId: string }) => {
    const { token, groupId } = groupData;

    const decode: any = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) return;
    socket.join(groupId);

    let groupParticipant: any = await GroupParticipant.findOne({
      group: groupId,
      user: decode.data.id,
    });
    if (!groupParticipant) {
      groupParticipant = new GroupParticipant();
      groupParticipant.group = groupId;
      groupParticipant.user = decode.data.id;
      groupParticipant.socketId = socket.id;
      await groupParticipant.save();
    } else {
      groupParticipant.socketId = socket.id;
      await groupParticipant.save();
    }

    socket.emit("connected");
    groupParticipant.user = await User.findById(decode.data.id, "name");
    socket.in(groupId).emit("member joined", groupParticipant);
  });

  socket.on(
    "new message",
    async (newMessage: { token: string; group: string; message: string }) => {
      const { token, group, message } = newMessage;

      const decode: any = jwt.verify(token, process.env.JWT_SECRET);
      if (!decode) return;

      const user = await User.findById(decode.data.id, "name");
      if (!user) return;

      const chat: any = new GroupChat();
      chat.group = group;
      chat.user = user;
      chat.message = message;
      await chat.save();

      io.in(group).emit("new message", chat);
    }
  );

  socket.on("disconnect", async () => {
    const groupParticipant = await GroupParticipant.findOneAndUpdate(
      { socketId: socket.id },
      { isActive: false },
      { new: true }
    );

    if (groupParticipant) {
      groupParticipant.user = await User.findById(
        groupParticipant.user,
        "name"
      );
      io.in(String(groupParticipant.group)).emit(
        "member left",
        groupParticipant
      );
    }

    // tslint:disable-next-line: no-console
    console.log("user disconnected");
  });
});
