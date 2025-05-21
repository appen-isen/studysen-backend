import axios from 'axios';

export const BASE_URL = 'http://localhost:3000/v1';

const ApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

export default ApiClient;
