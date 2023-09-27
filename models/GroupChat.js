var mongoose = require("mongoose");

var GroupChatSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: [true, "can't be blank"] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mongoose.model("GroupChat", GroupChatSchema);
