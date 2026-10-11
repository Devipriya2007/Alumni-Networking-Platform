
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        const url = config.url || "";

        const isPublicRequest =
            url.includes("profiles/") ||
            url.includes("login/") ||
            url.includes("register/") ||
            url.includes("token/");

        if (isPublicRequest) {
            delete config.headers.Authorization;
        } else if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;