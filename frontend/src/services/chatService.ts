import axiosClient from ".";

export const chatService = {
  async getChats(activeChatId = null) {
    const params = activeChatId ? { activeChatId } : {};
    const response = await axiosClient.get('/chat', { params });
    return response.data;
  },

  async accessChat(userId) {
    const response = await axiosClient.post('/chat', { userId });
    return response.data;
  },

  async createGroup(groupData) {
    const response = await axiosClient.post('/chat/group', groupData);
    return response.data;
  },

  async renameGroup(chatId, chatName) {
    const response = await axiosClient.put('/chat/group/rename', { chatId, chatName });
    return response.data;
  },

  async addToGroup(chatId, userId) {
    const response = await axiosClient.put('/chat/group/add', { chatId, userId });
    return response.data;
  },

  async removeFromGroup(chatId, userId) {
    const response = await axiosClient.put('/chat/group/remove', { chatId, userId });
    return response.data;
  },

  async markMessagesAsRead(chatId) {
    const response = await axiosClient.put(`/messages/read/${chatId}`);
    return response.data;
  },
};
