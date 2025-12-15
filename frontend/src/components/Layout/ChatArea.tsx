import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Layout, Typography, Spin } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import io, { Socket } from "socket.io-client";
import MessageList from "../Message/MessageList";
import MessageInput from "../Message/MessageInput";
import ChatHeader from "../Chat/ChatHeader";
import { messageService } from "../../services/messageService";
import { API_CONFIG, SOCKET_EVENTS } from "../../utils/constants";

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
  chat: {
    _id: string;
  };
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat?: boolean;
  users: User[];
}

interface ChatAreaProps {
  selectedChat: Chat | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const {
    data,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages", selectedChat?._id],
    queryFn: () => selectedChat ? messageService.getMessages(selectedChat._id) : Promise.resolve([]),
    enabled: !!selectedChat,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { content: string; chatId: string }) => messageService.sendMessage(messageData),
    onSuccess: (newMessage: Message) => {
      setMessages((prev) => Array.isArray(prev) ? [...prev, newMessage] : [newMessage]);
      scrollToBottom();
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error: any) => {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    },
  });

  useEffect(() => {
    if (user._id) {
      const newSocket = io(API_CONFIG.SOCKET_URL);
      setSocket(newSocket);

      newSocket.emit(SOCKET_EVENTS.SETUP, user);

      newSocket.on(SOCKET_EVENTS.CONNECTED, () => {
        console.log("Socket connected");
      });

      newSocket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (newMessageReceived) => {
        queryClient.invalidateQueries({ queryKey: ["chats"] });

        if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
          setMessages((prev) => Array.isArray(prev) ? [...prev, newMessageReceived] : [newMessageReceived]);
          scrollToBottom();
        }
      });

      newSocket.on(SOCKET_EVENTS.TYPING, (room) => {
        if (room === selectedChat?._id) {
          setIsTyping(true);
        }
      });

      newSocket.on(SOCKET_EVENTS.STOP_TYPING, (room) => {
        if (room === selectedChat?._id) {
          setIsTyping(false);
        }
      });

      newSocket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
        console.log("User came online:", userId);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      });

      newSocket.on(SOCKET_EVENTS.USER_OFFLINE, (userId) => {
        console.log("User went offline:", userId);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user._id, selectedChat?._id, queryClient]);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit(SOCKET_EVENTS.JOIN_CHAT, selectedChat._id);
      setMessages(data || []);
      refetchMessages();
    }
  }, [socket, selectedChat, refetchMessages, data]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      messageService.markChatAsRead(selectedChat._id).catch(error => {
        console.error('Error marking messages as read:', error);
      });
    }
  }, [selectedChat?._id, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedChat) return;

    try {
      const newMessage = await sendMessageMutation.mutateAsync({
        content: content.trim(),
        chatId: selectedChat._id,
      });

      socket?.emit(SOCKET_EVENTS.NEW_MESSAGE, {
        ...newMessage,
        chat: selectedChat,
      });
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && selectedChat) {
      if (isTyping) {
        socket.emit(SOCKET_EVENTS.TYPING, selectedChat._id);
      } else {
        socket.emit(SOCKET_EVENTS.STOP_TYPING, selectedChat._id);
      }
    }
  };

  if (!selectedChat) {
    return (
      <Layout.Content className="flex-1 flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <InfoCircleOutlined className="text-3xl text-gray-400" />
          </div>
          <Typography.Title level={3} className="text-gray-700 mb-4">
            Select a chat to start messaging
          </Typography.Title>
          <Typography.Text className="text-gray-500 text-lg">
            Choose a conversation from the sidebar or search for a user to begin
            chatting
          </Typography.Text>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content
      className="flex-1 flex flex-col overflow-hidden"
      role="main"
      aria-label="Chat area"
    >
      <ChatHeader chat={selectedChat} />

      <div
        className="flex-1 overflow-y-auto bg-gray-100"
        role="log"
        aria-label="Messages"
      >
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUser={user}
              isLoading={messagesLoading}
              onMessageUpdate={refetchMessages}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
          typing...
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={sendMessageMutation.isPending}
      />
    </Layout.Content>
  );
};

export default ChatArea;
