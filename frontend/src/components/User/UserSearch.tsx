import React from 'react';
import { Avatar, Badge, Typography, Space } from 'antd';
import { getInitials } from '../../utils/helpers';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface UserSearchProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ users, onUserSelect }) => {
  return (
    <Space direction="vertical" className="w-full">
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserSelect(user)}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
        >
          <Badge dot={user.isOnline} color="green" offset={[-5, 35]}>
            <Avatar
              src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`}
              className="bg-blue-500"
            >
              {getInitials(user.name)}
            </Avatar>
          </Badge>

          <div className="flex-1 min-w-0">
            <Typography.Text strong className="text-gray-900 truncate block">{user.name}</Typography.Text>
            <Typography.Text className="text-gray-600 text-sm truncate block">{user.email}</Typography.Text>
          </div>

          <Typography.Text className="text-xs text-gray-500">
            {user.isOnline ? 'Online' : 'Offline'}
          </Typography.Text>
        </div>
      ))}
    </Space>
  );
};

export default UserSearch;