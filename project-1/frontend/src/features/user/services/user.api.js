import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/users",
  withCredentials: true,
});

// PROFILE
export const getProfile = async (username) => {
  const res = await api.get(`/profile/${username}`);
  return res.data;
};
export const searchUsersAPI = async (query, signal) => {
  const res = await api.get("/search", {
    params: { q: query },
    signal,
  });

  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/profile", data,{
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
  return res.data;
  }

// FOLLOW REQUEST
export const followUser = async (username) => {
  const res = await api.post(`/follow/${username}`);
  return res.data;
};

// UNFOLLOW
export const unfollowUser = async (username) => {
  const res = await api.delete(`/unfollow/${username}`);
  return res.data;
};

// GET FOLLOWERS
export const getFollowers = async (username) => {
  const res = await api.get(`/followers/${username}`);
  return res.data;
};

// GET FOLLOWING
export const getFollowing = async (username) => {
  const res = await api.get(`/following/${username}`);
  return res.data;
};