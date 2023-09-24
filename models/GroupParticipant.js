var mongoose = require("mongoose");

var GroupParticipantSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    socketId: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

  },
  { timestamps: true }
);

mongoose.model("GroupParticipant", GroupParticipantSchema);
