import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://studysen.fr/v1';

const ApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

export default ApiClient;
