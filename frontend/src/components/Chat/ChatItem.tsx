import React from 'react';
import { Avatar, Badge, Typography, Space } from 'antd';
import { formatTime } from '../../utils/helpers';

interface User {
  _id: string;
  name: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  createdAt: string;
  readBy?: User[];
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat?: boolean;
  users: User[];
  latestMessage?: Message;
  unreadCount?: number;
}

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onClick }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getChatDisplayInfo = () => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName || 'Group Chat',
        avatar: (chat.chatName || 'G').charAt(0).toUpperCase(),
        isOnline: false,
      };
    } else {
      const otherUser = chat.users.find(u => u._id !== user._id);
      return {
        name: otherUser?.name || 'Unknown User',
        avatar: otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=random&color=fff&size=128`,
        isOnline: otherUser?.isOnline || false,
      };
    }
  };

  const { name, avatar, isOnline } = getChatDisplayInfo();
  const latestMessage = chat.latestMessage;
  const unreadCount = chat.unreadCount || 0;
  const isUnread = latestMessage && latestMessage.sender._id !== user._id && !latestMessage.readBy?.some(u => u._id === user._id);
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-200 ${
        isSelected
          ? 'bg-blue-50 border-r-4 border-blue-500'
          : 'hover:bg-gray-100'
      }`}
    >
      <Space size="middle">
        <Badge dot={isOnline} color="green" offset={[-5, 35]}>
          <Avatar
            src={avatar.startsWith('http') ? avatar : undefined}
            size="large"
            className="bg-gray-400"
          >
            {avatar.startsWith('http') ? undefined : avatar}
          </Avatar>
        </Badge>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Typography.Text
              strong
              className={`truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
            >
              {name}
            </Typography.Text>
            {latestMessage && (
              <Typography.Text className="text-xs text-gray-500">
                {formatTime(latestMessage.createdAt)}
              </Typography.Text>
            )}
          </div>

          {latestMessage ? (
            <div className="flex items-center justify-between mt-1">
              <Typography.Text
                className={`text-sm ${
                  isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                }`}
              >
                <span className="font-medium">
                  {latestMessage.sender._id === user._id ? 'You: ' : ''}
                </span>
                {latestMessage.content.length > 10
                  ? `${latestMessage.content.substring(0, 10)}...`
                  : latestMessage.content}
              </Typography.Text>
              {hasUnread && (
                <Badge count={unreadCount} size="small" className="ml-2" />
              )}
            </div>
          ) : (
            <Typography.Text className="text-sm text-gray-400 mt-1">
              {chat.isGroupChat ? 'Group created' : 'Start a conversation'}
            </Typography.Text>
          )}
        </div>
      </Space>
    </div>
  );
};

export default ChatItem;