import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useProfile } from "../../user/hooks/useProfile";
import ProfileHeader from "../components/profile-components/ProfileHeader";
import ProfileGrid from "../components/profile-components/ProfileGrid";
import "../../user/style/profile.scss";
import { useFollow } from "../hooks/useFollow";
import EditProfile from "../components/EditProfile";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const {
    profileUser,
    posts,
    followersCount,
    followingCount,
    isFollowing,
    setProfileState,
    loading,
    updateProfile
  } = useProfile(username);

  const { handleFollow, handleUnfollow } = useFollow();

  const isOwnProfile =
    currentUser?._id?.toString() === profileUser?._id?.toString();

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!profileUser) return <div>User not found</div>;

  const onFollowClick = async () => {
    if (isFollowing) {
      await handleUnfollow(username);
      setProfileState((prev) => ({
        ...prev,
        isFollowing: false,
        followersCount: prev.followersCount - 1,
      }));
    } else {
      await handleFollow(username);
      setProfileState((prev) => ({
        ...prev,
        isFollowing: true,
        followersCount: prev.followersCount + 1,
      }));
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileState((prev) => ({
      ...prev,
      profileUser: updatedUser,   
    }));
  };
  return (
    <div className="profile-container">
      <ProfileHeader
        profileUser={profileUser}
        postsCount={posts.length}
        followersCount={followersCount}
        followingCount={followingCount}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followLoading={loading}
        onFollowClick={onFollowClick}
        onEditClick={() => setShowEdit(true)}
      />
       {showEdit && (
        <div className="modal">
          <EditProfile
          currentUser={profileUser}
          onClose={() => setShowEdit(false)}
          onUpdate={updateProfile}
          />
        </div>
      )}
      <ProfileGrid posts={posts} />
    </div>
  );
};

export default Profile;
