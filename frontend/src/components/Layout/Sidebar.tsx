import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Layout, Avatar, Button, Input, Typography, Space, Spin } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import ChatItem from '../Chat/ChatItem';
import UserSearch from '../User/UserSearch';
import GroupModal from '../Group/GroupModal';
import { getInitials } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { IoLogOutOutline } from "react-icons/io5";
interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
}

interface Chat {
  _id: string;
  name?: string;
  isGroupChat?: boolean;
  users: User[];
  latestMessage?: any;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
}

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  searchQuery: string;
  searchResults: User[];
  onSearch: (query: string) => void;
  onUserSelect: (user: User) => void;
  chatsLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  searchQuery,
  searchResults,
  onSearch,
  onUserSelect,
  chatsLoading
}) => {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUser = user!;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <Layout.Sider
      width={320}
      className="!bg-white border-r border-gray-200 shadow-lg"
      breakpoint="lg"
      collapsedWidth={0}
      role="navigation"
      aria-label="Chat sidebar"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
        <Space direction="vertical" size="small" className="w-full">
          <div className="flex items-center justify-between">
            <Space>
              <Avatar src={currentUser.profilePic} className="bg-white bg-opacity-20">
                {currentUser.name ? getInitials(currentUser.name) : 'U'}
              </Avatar>
              <div>
                <Typography.Text strong className="text-white">{currentUser.name || 'User'}</Typography.Text>
                <br />
                Welcome Back
                Sign in to your account
                
                <Typography.Text className="text-blue-100 text-xs">{currentUser.email || ''}</Typography.Text>
              </div>
            </Space>
            <Button
              type="text"
              icon={<IoLogOutOutline className='text-white' />}
              onClick={handleLogout}
              className="text-white hover:bg-blue-700"
              title="Logout"
            />
          </div>

          <Input
            placeholder="Search chats, contacts..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            prefix={<SearchOutlined />}
            className="bg-white/10 border-white/20 text-white placeholder-white/60 hover:border-white/40 focus:border-white/50"
          />
        </Space>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowGroupModal(true)}
          block
          className="bg-green-600 border-0 hover:bg-green-700"
        >
          New Group
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Typography.Text className=" mb-2 block">Search Results</Typography.Text>
            <UserSearch
              users={searchResults}
              onUserSelect={onUserSelect}
            />
          </div>
        </div>
      )}

      {searchResults.length === 0 && (
        <div className="flex-1  overflow-y-auto">
          <div className="p-4">
            <Typography.Text className=" mb-2 block">
              Chats ({chats.length})
            </Typography.Text>
            {chatsLoading ? (
              <div className="space-y-3">
                <Spin size="large" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8">
                <Typography.Text className="text-gray-500">No chats yet</Typography.Text>
                <br />
                <Typography.Text className="text-gray-400 text-sm">Start a conversation by searching for users</Typography.Text>
              </div>
            ) : (
              <Space direction="vertical" className="w-full">
                {chats.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChat?._id === chat._id}
                    onClick={() => onChatSelect(chat)}
                  />
                ))}
              </Space>
            )}
          </div>
        </div>
      )}

      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={(newGroup: Chat) => {
            onChatSelect(newGroup);
            setShowGroupModal(false);
          }}
        />
      )}
    </Layout.Sider>
  );
};

export default Sidebar;