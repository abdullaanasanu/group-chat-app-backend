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
      // get all groups with pagination
      // let groups = await Group.find().sort({ _id: -1 }).lean();
      const {
        query: { limit, skip },
      } = req;
      const limitQuery = limit ? parseInt(limit as string) : 3;
      const skipQuery = skip ? parseInt(skip as string) : 0;
      let groups = await Group.find()
        .skip(skipQuery)
        .limit(limitQuery)
        .sort({ _id: -1 })
        .lean();
      groups = await Promise.all(
        groups.map(async (group: any) => {
          group.totalParticipants = await GroupParticipant.countDocuments({
            group: group._id,
            isActive: true,
          });
          return group;
        })
      );
      const totalGroups = await Group.countDocuments();
      return res.status(200).json({
        success: true,
        groups,
        totalGroups
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
      // find last 10 messages
      group.chat = await GroupChat.find({ group: group._id })
        .populate("user", "name")
        .sort({ _id: -1 })
        .limit(10)
        .lean();
      group.chat = group.chat.reverse();
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

router.get(
  "/chat/:id",
  userAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        query: { limit, skip },
      } = req;
      const limitQuery = limit ? parseInt(limit as string) : 10;
      const skipQuery = skip ? parseInt(skip as string) : 0;
      // Find the old messages by skipping new ones
      const chat = await GroupChat.find({ group: req.params.id })
        .populate("user", "name")
        .skip(skipQuery)
        .limit(limitQuery)
        .sort({ _id: -1 })
        .lean();
      chat.reverse();
      return res.status(200).json({
        success: true,
        chat,
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
