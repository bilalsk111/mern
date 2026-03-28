import { useEffect, useState, useRef } from "react";
import { getProfile, updateProfile as updateProfileAPI } from "../services/user.api";

const profileCache = {};

export const useProfile = (username) => {
  const [profileState, setProfileState] = useState({
    profileUser: null,
    posts: [],
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
  });

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetching = useRef(false);

  // ✅ FETCH PROFILE
  useEffect(() => {
    if (!username) return;

    if (profileCache[username]) {
      setProfileState(profileCache[username]);
      setLoading(false);
      return;
    }

    if (fetching.current) return;

    const fetchProfile = async () => {
      try {
        fetching.current = true;
        setLoading(true);

        const data = await getProfile(username);

        const profileData = {
          profileUser: data.user,
          posts: data.posts || [],
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          isFollowing: data.isFollowing || false,
        };

        profileCache[username] = profileData;
        setProfileState(profileData);

      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
        fetching.current = false;
      }
    };

    fetchProfile();
  }, [username]);

const updateProfile = async (formData) => {
    try {
      setUpdateLoading(true);
      const res = await updateProfileAPI(formData);
      const updatedUser = res.user;

      // 1. Update local state immediately
      setProfileState((prev) => ({
        ...prev,
        profileUser: updatedUser,
      }));

      // 2. IMPORTANT: Update the Cache
      // If username changed, delete the old cache entry
      if (username !== updatedUser.username) {
        delete profileCache[username];
      }
      
      // Update/Create cache for the new/current username
      profileCache[updatedUser.username] = {
        ...profileState,
        profileUser: updatedUser,
      };

      return updatedUser;
    } catch (err) {
       // ... handle error
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
    ...profileState,
    setProfileState,
    loading,
    updateLoading,
    updateProfile,
    error,
  };
};