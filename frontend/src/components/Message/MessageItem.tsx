import React, { useState } from 'react';
import { Avatar, Typography, Dropdown, Button } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatTime, getInitials } from '../../utils/helpers';
import { messageService } from '../../services/messageService';
import { toast } from 'react-toastify';

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

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onMessageUpdate?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onMessageUpdate }) => {

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>(message.content);

  const handleDelete = async () => {
    try {
      await messageService.deleteMessage(message._id);
      toast.success('Message deleted');
      if (onMessageUpdate) onMessageUpdate();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      try {
        await messageService.updateMessage(message._id, editContent.trim());
        toast.success('Message updated');
        setIsEditing(false);
        if (onMessageUpdate) onMessageUpdate();
      } catch {
        toast.error('Failed to update message');
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: handleDelete,
    },
  ];

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-200 text-gray-900 rounded-bl-md'
        }`}>
          <textarea
            value={editContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
            className="w-full bg-transparent border-none outline-none resize-none text-sm"
            rows={Math.min(editContent.split('\n').length, 4)}
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
            <Button size="small" type="primary" onClick={handleSaveEdit}>Save</Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
        isOwn
          ? 'bg-blue-500 text-white rounded-br-md'
          : 'bg-gray-200 text-gray-900 rounded-bl-md'
      }`}>
        <Typography.Text className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </Typography.Text>
        {isOwn && (
          <div className="flex justify-end mt-1">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="text-white hover:bg-blue-600 opacity-70 hover:opacity-100"
              />
            </Dropdown>
          </div>
        )}
      </div>
    );
  };

  const renderAvatar = () => {
    if (isOwn) return null;

    const { sender } = message;
    return (
      <Avatar
        src={sender.profilePic}
        className="bg-gray-400"
      >
        {getInitials(sender.name)}
      </Avatar>
    );
  };

  return (
    <div className={`flex items-end space-x-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && renderAvatar()}

      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {renderMessageContent()}

        <Typography.Text className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </Typography.Text>
      </div>

      {isOwn && (
        <Avatar src={message.sender.profilePic} className="bg-blue-500">
          {getInitials(message.sender.name)}
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;