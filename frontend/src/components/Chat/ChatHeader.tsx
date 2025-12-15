import React from "react";
import { Avatar, Button, Space, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { FaVideo } from "react-icons/fa6";
import { MdOutlineLocalPhone } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
interface User {
  _id: string;
  name: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat?: boolean;
  users: User[];
}

interface ChatHeaderProps {
  chat: Chat;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getChatDisplayInfo = () => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName || "Group Chat",
        avatar: (chat.chatName || "G").charAt(0).toUpperCase(),
        subtitle: `${chat.users.length} members`,
        isOnline: false,
      };
    } else {
      const otherUser = chat.users.find((u) => u._id !== user._id);
      return {
        name: otherUser?.name || "Unknown User",
        avatar:
          otherUser?.profilePic ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            otherUser?.name || "U"
          )}&background=random&color=fff&size=128`,
        subtitle: otherUser?.isOnline ? "Online" : "Offline",
        isOnline: otherUser?.isOnline || false,
      };
    }
  };

  const { name, avatar, subtitle } = getChatDisplayInfo();

  return (
    <div className="bg-blue-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Space>
        <Avatar
          src={avatar.startsWith("http") ? avatar : undefined}
          className="bg-white bg-opacity-20"
        >
          {avatar.startsWith("http") ? undefined : avatar}
        </Avatar>

        <div>
          <Typography.Title level={4} className="text-white mb-0">
            {name}
          </Typography.Title>
          <Typography.Text className="text-blue-100">
            {subtitle}
          </Typography.Text>
        </div>
      </Space>

      <Space>
        {chat.isGroupChat && (
          <Button
            type="text"
            icon={<TeamOutlined />}
            className="text-white hover:bg-white hover:bg-opacity-20"
            title="Group info"
          />
        )}

        <Button
          type="text"
          icon={<FaVideo />}
          className="text-white hover:bg-white hover:bg-opacity-20"
          title="Video call"
        />
        <Button
          type="text"
          icon={<MdOutlineLocalPhone />}
          className="text-white hover:bg-white hover:bg-opacity-20"
          title="Voice call"
        />
        <Button
          type="text"
          icon={<BsThreeDotsVertical />}
          className="text-white hover:bg-white hover:bg-opacity-20"
          title="Chat info"
        />
      </Space>
    </div>
  );
};

export default ChatHeader;
