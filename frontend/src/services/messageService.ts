import axiosClient from ".";

export const messageService = {
  async getMessages(chatId) {
    const response = await axiosClient.get(`/messages/${chatId}`);
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await axiosClient.post("/messages", messageData);
    return response.data;
  },

  async markAsRead(messageId) {
    const response = await axiosClient.put(`/messages/read/single/${messageId}`);
    return response.data;
  },

  async markChatAsRead(chatId) {
    const response = await axiosClient.put(`/messages/${chatId}/read`);
    return response.data;
  },

  async deleteMessage(messageId) {
    const response = await axiosClient.delete(`/messages/${messageId}`);
    return response.data;
  },

  async updateMessage(messageId, content) {
    const response = await axiosClient.put(`/messages/${messageId}`, { content });
    return response.data;
  },
};
