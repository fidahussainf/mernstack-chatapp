import User from "../models/userModel.js";
import { HTTP_STATUS } from "../utils/constants.js";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      // Generate a dummy profile picture if none exists
      const dummyProfilePic = user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`;

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: dummyProfilePic,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search.trim(), $options: "i" } },
            { email: { $regex: req.query.search.trim(), $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ name: 1 })
      .limit(50); // Limit results for performance

    // Add dummy profile pictures for users without them
    const usersWithProfiles = users.map(user => ({
      ...user.toObject(),
      profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`
    }));

    res.json(usersWithProfiles);
  } catch (error) {
    console.error("All users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUserProfile, allUsers };