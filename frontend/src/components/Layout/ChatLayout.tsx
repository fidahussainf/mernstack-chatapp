import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/user';

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

const ChatLayout: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = useQuery({
    queryKey: ['chats', selectedChat?._id],
    queryFn: async () => {
      try {
        return await chatService.getChats(selectedChat?._id as any);
      } catch (error) {
        toast.error('Failed to load chats. Please refresh the page.');
        console.error('Chats error:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await userService.getUsers(query);
        setSearchResults(results);
      } catch (error) {
        toast.error('Failed to search users. Please check your connection.');
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setSearchQuery('');
    setSearchResults([]);

    chatService.markMessagesAsRead(chat._id).catch((error: any) => {
      console.error('Error marking messages as read:', error);
    });
  };

  const handleUserSelect = async (user: User) => {
    try {
      const chat = await chatService.accessChat(user._id);
      setSelectedChat(chat);
      setSearchQuery('');
      setSearchResults([]);

      await refetchChats();
      toast.success(`Chat with ${user.name}`);

      setTimeout(() => {
        refetchChats();
      }, 100);
    } catch (error) {
      toast.error('Failed to start chat. Please try again.');
      console.error('Access chat error:', error);
    }
  };

  return (
    <Layout className="h-screen">
      <Sidebar
        chats={(chats as Chat[]) || []}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearch={handleSearch}
        onUserSelect={handleUserSelect}
        chatsLoading={chatsLoading}
      />
      <Layout className="min-w-0">
        <ChatArea
          selectedChat={selectedChat}
        />
      </Layout>
    </Layout>
  );
};

export default ChatLayout;