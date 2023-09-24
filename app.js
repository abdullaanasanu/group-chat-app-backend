const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// Create global app object
var app = express();

app.use(cors());
// app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"));

require("./models/User");
require("./models/Group");
require("./models/GroupParticipant");
require("./models/GroupChat");

const GroupChat = mongoose.model("GroupChat");
const User = mongoose.model("User");
const Group = mongoose.model("Group");
const GroupParticipant = mongoose.model("GroupParticipant");

app.use("/api", require("./routes"));

app.get("/", function (req, res) {
  res.status(200).send(
    `
        Chat App API
      `
  );
});

var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + server.address().port);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (groupData) => {
    let token = groupData.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return;
      }
      socket.join(groupData.groupId);
      // check and save user to group participant
      GroupParticipant.findOne({
        group: groupData.groupId,
        user: decoded.data.id,
      }).then((groupParticipant) => {
        if (!groupParticipant) {
          let groupParticipant = new GroupParticipant();
          groupParticipant.group = groupData.groupId;
          groupParticipant.user = decoded.data.id;
          groupParticipant.socketId = socket.id;
          groupParticipant.save().then(async function (groupParticipant) {
            socket.emit("connected");
            groupParticipant.user = await User.findById(groupParticipant.user);
            socket
              .in(groupData.groupId)
              .emit("member joined", groupParticipant);
          });
        } else {
          groupParticipant.socketId = socket.id;
          groupParticipant.isActive = true;
          groupParticipant.save().then(async function (groupParticipant) {
            socket.emit("connected");
            groupParticipant.user = await User.findById(groupParticipant.user);
            socket
              .in(groupData.groupId)
              .emit("member joined", groupParticipant);
          });
        }
      });
    });
  });

  //   socket.on("typing", (room) => {
  //     socket.in(room).emit("typing");
  //   });

  //   socket.on("stop typing", (room) => {
  //     socket.in(room).emit("stop typing");
  //   });

  socket.on("new message", (newMessage) => {
    console.log(newMessage);
    let token = newMessage.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        return;
      }
      let user = await User.findById(decoded.data.id);
      var chat = new GroupChat();
      chat.group = newMessage.group;
      chat.user = user;
      chat.message = newMessage.message;
      chat.save().then(function (chat) {
        GroupChat.findById(chat._id)
          .populate("user")
          .then(function (chat) {
            io.in(newMessage.group).emit("new message", chat);
          });
      });
    });
  });

  socket.on("disconnect", () => {
    GroupParticipant.findOneAndUpdate(
      { socketId: socket.id },
      { isActive: false },
      { new: true }
    ).then(async (groupParticipant) => {
      if (groupParticipant) {
        console.log("member left");
        console.log(groupParticipant.group);
        groupParticipant.user = await User.findById(groupParticipant.user);
        io.in(String(groupParticipant.group)).emit(
          "member left",
          groupParticipant
        );
        // io.in(groupParticipant.group).emit("member left", groupParticipant);
      }
    });
    console.log("Disconnected from socket.io");
  });
});
