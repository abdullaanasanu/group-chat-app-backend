import mongoose, { Schema, Document } from "mongoose";

interface IGroupParticipant extends Document {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  socketId: string;
  isActive: boolean;
}

const GroupParticipantSchema: Schema = new Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    socketId: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGroupParticipant>(
  "GroupParticipant",
  GroupParticipantSchema
);