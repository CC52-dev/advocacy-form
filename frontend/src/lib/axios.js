import axios from 'axios';

const api = axios.create({
  baseURL: 'https://services.satsankalpa.org',
  withCredentials: true, // This is important for handling cookies
});

export default api; 