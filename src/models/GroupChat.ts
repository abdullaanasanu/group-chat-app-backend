import mongoose, { Schema, Document } from "mongoose";

interface IGroupChat extends Document {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  message: string;
  isSystem: boolean;
  systemAction: string;
}

const GroupChatSchema: Schema = new Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: [true, "can't be blank"] },
    isSystem: { type: Boolean, default: false },
    systemAction: { type: String, enum: ["join", "leave"] },
  },
  { timestamps: true }
);

const GroupChat = mongoose.model<IGroupChat>("GroupChat", GroupChatSchema);

export default GroupChat;