var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },

  },
  { timestamps: true }
);

mongoose.model("Group", GroupSchema);
