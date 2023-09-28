import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

function getTokenFromHeader(req: Request): string | null {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

export const userAuth = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return next({ status: 401, message: " No Token Found " });
    const decode: any = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) return next({ status: 401, message: " Invalid Token " });
    const user = await User.findOne({
      _id: decode.data.id,
      isBlocked: false,
    });
    if (!user) return next({ status: 401, message: " Unauthorised Access " });
    req.payload = token;
    req.user = user;
    next();
  } catch (err) {
    next({ status: 401, message: err });
  }
};

// export default auth;
