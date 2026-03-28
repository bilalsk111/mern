import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// GET FEED
export const GetFeed = async () => {
  const res = await api.get("/posts/feed");
  return res.data; 
};

// LIKE
export const toggleLike = async (postId) => {
  const res = await api.post(`/posts/like/${postId}`);
  return res.data;
};

// CREATE
export const createPost = async (formData) => {
  const res = await api.post("/posts/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
//REELS
// export const getReels = async () => {
//   const res = await api.get("/posts/reels");
//   return res.data;
// };
// DELETE
export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

// SAVE
export const toggleSavePost = async (id) => {
  const res = await api.post(`/posts/${id}/save`);
  return res.data;
};
export const getSavedPosts = async () => {
  const res = await api.get("/posts/saves"); 
  return res.data;
};
