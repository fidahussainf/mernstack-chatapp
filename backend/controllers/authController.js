import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { HTTP_STATUS } from "../utils/constants.js";
import {
  asyncHandler,
  ValidationError,
  AuthenticationError,
  sanitizeString,
  sanitizeEmail,
  createErrorResponse
} from "../utils/errorHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError("Please fill in all fields");
  }

  // Validate password strength
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }

  // Sanitize inputs
  const sanitizedName = sanitizeString(name, 50);
  const sanitizedEmail = sanitizeEmail(email);

  // Check if user already exists
  const userExists = await User.findOne({ email: sanitizedEmail });
  if (userExists) {
    throw new ValidationError("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name: sanitizedName,
    email: sanitizedEmail,
    password: hashedPassword,
    profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizedName)}&background=random&color=fff&size=128`,
  });

  if (!user) {
    throw new ValidationError("Failed to create user");
  }

  res.status(HTTP_STATUS.CREATED).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError("Please provide email and password");
  }

  // Sanitize email
  const sanitizedEmail = sanitizeEmail(email);

  // Find user
  const user = await User.findOne({ email: sanitizedEmail });
  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Update user status
  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`,
    isOnline: user.isOnline,
    token: generateToken(user._id),
  });
});

export { registerUser, loginUser };