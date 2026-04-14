import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;