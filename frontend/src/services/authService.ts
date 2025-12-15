import axiosClient from ".";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  isOnline?: boolean;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await axiosClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await axiosClient.put('/users/profile', userData);
    return response.data;
  },
};
