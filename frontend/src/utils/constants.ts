export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"
};

export const SOCKET_EVENTS = {
  SETUP: 'setup',
  CONNECTED: 'connected',
  JOIN_CHAT: 'join chat',
  NEW_MESSAGE: 'new message',
  MESSAGE_RECEIVED: 'message received',
  TYPING: 'typing',
  STOP_TYPING: 'stop typing',
  USER_ONLINE: 'user online',
  USER_OFFLINE: 'user offline'
};

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};