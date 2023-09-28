import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  generateJWT: () => string;
  isBlocked: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "can't be blank"] },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String },
    isBlocked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

UserSchema.methods.generateJWT = function (): string {
  const token = jwt.sign(
    {
      data: {
        id: this._id,
      },
    },
    process.env.JWT_SECRET
  );
  return token;
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;