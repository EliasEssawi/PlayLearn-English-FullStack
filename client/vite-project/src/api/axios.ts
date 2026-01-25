import axios from "axios";

// Base URL for all API requests, loaded from Vite environment variables
const baseURL = import.meta.env.VITE_API_URL; // e.g. https://xxx.onrender.com

// Create a pre-configured axios instance
// This instance will be used throughout the client to communicate with the backend
const api = axios.create({
  baseURL,              // Sets the base URL for all HTTP requests
  withCredentials: true,// Allows sending cookies (used for authentication/session handling)
});

// Export the configured axios instance so it can be reused in other files
export default api;
