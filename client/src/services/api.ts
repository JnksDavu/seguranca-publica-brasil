import axios from "axios";

const SYSTEM_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzeXN0ZW0iOnRydWUsImlhdCI6MTc2MzUyMzAwMiwiZXhwIjoxODQxMjgzMDAyfQ.6d6G3zE_I516k1StpMmZIAMGOmbSvVkg0DFGWjbQnqE";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { 
    "Content-Type": "application/json",
    Authorization: `Bearer ${SYSTEM_TOKEN}`
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
