import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import { HTTP_STATUS } from "../utils/constants.js";

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "UserId param not sent with request" });
    }

    if (req.user._id.toString() === userId.toString()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Cannot create chat with yourself" });
    }

    // Find existing chat between these two users only
    let isChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId], $size: 2 } // Exactly 2 users and both must be in the array
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email profilePic",
    });

    if (isChat) {
      // Add unread count for existing chat
      const unreadCount = await Message.countDocuments({
        chat: isChat._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      });

      return res.json({
        ...isChat.toObject(),
        unreadCount
      });
    }

    const chatData = {
      chatName: null,
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );

    res.status(HTTP_STATUS.CREATED).json({
      ...fullChat.toObject(),
      unreadCount: 0 // New chats have no unread messages
    });
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const fetchChats = async (req, res) => {
  try {
    const { activeChatId } = req.query;

    // Only fetch chats where the current user is a participant
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name profilePic email",
    });

    // Calculate unread message count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        // Don't count unread messages for the active chat
        if (activeChatId && chat._id.toString() === activeChatId) {
          return {
            ...chat.toObject(),
            unreadCount: 0
          };
        }

        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user._id }, // Messages not sent by current user
          readBy: { $nin: [req.user._id] } // Messages where current user is NOT in readBy array
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json(chatsWithUnreadCount);
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createGroupChat = async (req, res) => {
  try {
    const { users, name } = req.body;

    if (!users || !name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Please fill all the fields" });
    }

    let parsedUsers;
    try {
      parsedUsers = JSON.parse(users);
    } catch (parseError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid users data" });
    }

    if (parsedUsers.length < 2) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "More than 2 users are required to form a group chat" });
    }

    parsedUsers.push(req.user._id);

    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(HTTP_STATUS.CREATED).json(fullGroupChat);
  } catch (error) {
    console.error("Create group chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Please provide chatId and chatName" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (error) {
    console.error("Rename group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Please provide chatId and userId" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Chat not found" });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Only group admin can add users" });
    }

    if (chat.users.includes(userId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "User already in group" });
    }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.json(added);
  } catch (error) {
    console.error("Add to group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Please provide chatId and userId" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Chat not found" });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Only group admin can remove users" });
    }

    if (!chat.users.includes(userId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "User not in group" });
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.json(removed);
  } catch (error) {
    console.error("Remove from group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
