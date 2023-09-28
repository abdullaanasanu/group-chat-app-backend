import mongoose, { Schema, Document, Model } from "mongoose";

interface IGroup extends Document {
  name: string;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },
  },
  { timestamps: true }
);

const Group: Model<IGroup> = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;