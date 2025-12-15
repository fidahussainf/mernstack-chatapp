import React from 'react';
import { Spin, Typography } from 'antd';
import MessageItem from './MessageItem';
import { formatDate, isSameDay } from '../../utils/helpers';
import { MdMessage } from 'react-icons/md';

interface User {
  _id: string;
  name: string;
  profilePic?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  isLoading: boolean;
  onMessageUpdate?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, isLoading, onMessageUpdate }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
           <MdMessage />
          </div>
          <Typography.Title level={4} className="text-gray-500 mb-2">No messages yet</Typography.Title>
          <Typography.Text className="text-gray-400">Start the conversation by sending a message</Typography.Text>
        </div>
      </div>
    );
  }

  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = messageDate.toDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="space-y-4 p-4">
      {Object.entries(groupedMessages).map(([dateKey, dayMessages]: [string, Message[]]) => (
        <div key={dateKey}>

          <div className="flex justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {isSameDay(dateKey, new Date()) ? 'Today' : formatDate(dateKey)}
            </div>
          </div>

          <div className="space-y-2">
            {dayMessages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={message.sender._id === currentUser._id}
                onMessageUpdate={onMessageUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;