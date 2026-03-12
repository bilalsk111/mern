import axios from "axios";

const api = axios.create({
  baseURL: "https://emotiontune-3m9v.onrender.com/api/auth",
  withCredentials: true
});

export const registerUser = (data) => api.post("/register", data);
export const loginUser = (data) => api.post("/login", data);
export const logoutUser = () => api.post("/logout");
export const getMe = () => api.get("/getme");