export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

export const CHAT_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group'
};

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  SETUP: 'setup',
  JOIN_CHAT: 'join chat',
  TYPING: 'typing',
  STOP_TYPING: 'stop typing',
  NEW_MESSAGE: 'new message',
  MESSAGE_RECEIVED: 'message received',
  USER_ONLINE: 'user online',
  USER_OFFLINE: 'user offline',
  CONNECTED: 'connected'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};