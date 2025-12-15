import React, { useState, useEffect } from 'react';
import {  useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Modal, Form, Input, Button, Avatar, Tag, List, Typography, Space } from 'antd';
import {  UserAddOutlined } from '@ant-design/icons';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/user';
import { getInitials } from '../../utils/helpers';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat?: boolean;
  users: User[];
}

interface GroupModalProps {
  onClose: () => void;
  onGroupCreated: (chat: Chat) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ onClose, onGroupCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim()) {
        try {
          const results = await userService.getUsers(searchQuery);
          const filteredResults = results.filter(
            (u: User) => u._id !== user._id && !selectedUsers.some(su => su._id === u._id)
          );
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers, user._id]);

  const createGroupMutation = useMutation({
    mutationFn: (groupData: { name: string; users: string[] }) => chatService.createGroup(groupData),
    onSuccess: (newGroup: Chat) => {
      toast.success('Group created successfully!');
      onGroupCreated(newGroup);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    },
  });

  const handleAddUser = (user: User) => {
    if (!selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSubmit = async (values: { groupName: string }) => {
    if (selectedUsers.length < 2) {
      toast.error('Please select at least 2 users');
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: values.groupName.trim(),
        users: selectedUsers.map(u => u._id),
      });
    } catch (error) {
      console.error('Create group error:', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  return (
    <Modal
      title="Create New Group"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        name="createGroup"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="groupName"
          label="Group Name"
          rules={[{ required: true, message: 'Please enter a group name!' }]}
        >
          <Input placeholder="Enter group name" />
        </Form.Item>

        <Form.Item label={`Add Members (${selectedUsers.length} selected)`}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
          />

          {selectedUsers.length > 0 && (
            <div className="mt-2">
              <Space wrap>
                {selectedUsers.map((user) => (
                  <Tag
                    key={user._id}
                    closable
                    onClose={() => handleRemoveUser(user._id)}
                    className="mb-2"
                  >
                    {user.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {searchResults.length > 0 && (
            <List
              className="mt-2 max-h-32 overflow-y-auto"
              size="small"
              dataSource={searchResults}
              renderItem={(user) => (
                <List.Item
                  onClick={() => handleAddUser(user)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <Space>
                    <Avatar src={user.profilePic} className="bg-blue-500">
                      {getInitials(user.name)}
                    </Avatar>
                    <div>
                      <Typography.Text strong>{user.name}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary" className="text-xs">
                        {user.email}
                      </Typography.Text>
                    </div>
                    <UserAddOutlined className="text-blue-500" />
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Form.Item>

        <Form.Item>
          <Space className="w-full">
            <Button onClick={handleCancel} block>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createGroupMutation.isPending}
              disabled={selectedUsers.length < 2}
              block
            >
              Create Group
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupModal;