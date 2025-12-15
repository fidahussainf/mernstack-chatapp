import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { HTTP_STATUS } from "../utils/constants.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } else {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Not authorized, token failed" });
  }
};

export { authMiddleware };
