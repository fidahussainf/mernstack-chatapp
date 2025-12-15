import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import { HTTP_STATUS } from "../utils/constants.js";

const allMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Chat ID is required" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name profilePic email")
      .populate("chat")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("All messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Content and chatId are required" });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Chat not found" });
    }

    if (!chat.users.includes(req.user._id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Not authorized to send message in this chat" });
    }

    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name profilePic email");
    message = await message.populate("chat");

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    res.status(HTTP_STATUS.CREATED).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Chat ID is required" });
    }

    // Mark all messages in chat as read by current user
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { allMessages, sendMessage, markMessagesAsRead };