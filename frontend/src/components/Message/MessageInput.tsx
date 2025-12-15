import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Form } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (value.trim() && !isTyping) {
      console.log('Starting typing indicator');
      setIsTyping(true);
      onTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      console.log('Stopping typing indicator');
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-4" role="form" aria-label="Send message">
      <Form onFinish={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <Input.TextArea
            value={message}
            onChange={handleInputChange}
            onPressEnter={handleKeyPress}
            placeholder="Type a message..."
            className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={disabled}
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<SendOutlined />}
          disabled={!message.trim() || disabled}
          className="bg-blue-500 border-0 hover:bg-blue-600"
          shape="circle"
        />
      </Form>

      <div className="text-xs text-gray-400 mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  );
};

export default MessageInput;