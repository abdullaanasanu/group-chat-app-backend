const mongoose = require("mongoose");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { body, check, validationResult } = require("express-validator");
const auth = require("../utils/auth");

// models
const Group = mongoose.model("Group");
const GroupParticipant = mongoose.model("GroupParticipant");
const GroupChat = mongoose.model("GroupChat");

// routes
router.post(
  "/create",
  body("name").exists().withMessage("Name is required"),
  auth.userAuth,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    var group = new Group();
    group.name = req.body.name;
    group.save().then(function (group) {
      return res.status(200).json({
        success: true,
        message: "Group created successfully",
        group: group,
      });
    });
  }
);

router.get("/", auth.userAuth, async (req, res, next) => {
  try {
    let groups = await Group.find().lean();
    groups = await Promise.all(
      groups.map(async (group) => {
        group.totalParticipants = await GroupParticipant.countDocuments({
          group: group._id,
            isActive: true,
        });
        return group;
      })
    );
    return res.status(200).json({
      success: true,
      groups: groups,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
});

router.get("/:id", auth.userAuth, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }
    group.participants = await GroupParticipant.find({
      group: group._id,
      isActive: true,
    })
      .populate("user")
      .lean()
      .sort({ updatedAt: -1 });
      group.chat = await GroupChat.find({ group: group._id }).populate("user", "name").lean()
    return res.status(200).json({
      success: true,
      group: group,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
});

router.get("/chat/:id", auth.userAuth, async (req, res, next) => {
  try {
    let chat = await GroupChat.find({ group: req.params.id })
      .populate("user", "name")
      .lean();

    return res.status(200).json({
      success: true,
      chat: chat,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
});

router.get("/participants/:id", auth.userAuth, async (req, res, next) => {
  try {
    let participants = await GroupParticipant.find({ group: req.params.id })
      .populate("user", "name")
      .lean();
    return res.status(200).json({
      success: true,
      participants: participants,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
});

module.exports = router;
