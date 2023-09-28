import express, { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";
// import bcrypt from "bcrypt";
import { userAuth } from "../utils/auth";

const router = express.Router();

// models
import Group from "../models/Group";
import GroupParticipant from "../models/GroupParticipant";
import GroupChat from "../models/GroupChat";

export interface AuthRequest extends Request {
  token?: string;
  user?: any;
}

// routes
router.post(
  "/create",
  [body("name").exists().withMessage("Name is required"), userAuth],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    const group = new Group();
    group.name = req.body.name;
    await group.save();

    return res.status(200).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  }
);

router.get(
  "/",
  userAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let groups = await Group.find().sort({ _id: -1 }).lean();
      groups = await Promise.all(
        groups.map(async (group: any) => {
          group.totalParticipants = await GroupParticipant.countDocuments({
            group: group._id,
            isActive: true,
          });
          return group;
        })
      );
      return res.status(200).json({
        success: true,
        groups,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }
  }
);

router.get(
  "/:id",
  userAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group: {
        participants: any;
        chat: any;
        name: string;
        _id: string;
      } = await Group.findById(req.params.id).lean();
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
        .populate("user", "name")
        .sort({ updatedAt: -1 })
        .lean();
      group.chat = await GroupChat.find({ group: group._id })
        .populate("user", "name")
        .sort({ _id: 1 })
        .lean();
      return res.status(200).json({
        success: true,
        group,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }
  }
);

export default router;
