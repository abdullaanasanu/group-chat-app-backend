var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");

var UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String },

  },
  { timestamps: true }
);

UserSchema.methods.generateJWT = function () {

  const token = jwt.sign(
    {
      data: {
        id: this._id,
      },
    },
    process.env.JWT_SECRET,
  );
  return token;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
 