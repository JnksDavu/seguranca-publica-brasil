import axios from "axios";

const token = import.meta.env.VITE_API_TOKEN;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err?.response || err);
    return Promise.reject(err);
  }
);

export default api;
