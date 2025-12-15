import axiosClient from ".";

export const userService = {
  async getUsers(search = '') {
    const params = search ? { search } : {};
    const response = await axiosClient.get('/users', { params });
    return response.data;
  },
};
