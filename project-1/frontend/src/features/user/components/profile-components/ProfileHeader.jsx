import React, { memo } from "react";
import ProfileStats from "./ProfileStats";

const ProfileHeader = ({
  profileUser,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  isOwnProfile,
  isFollowing = false,
  onFollowClick,
  onEditClick,
}) => {
  if (!profileUser) return null;

  const { name = "—", username = "", profileImage, bio = "" } = profileUser;
  const avatarSrc     = profileImage || "/default-avatar.png";
  const displayHandle = username ? `@${username}` : "";

  return (
    <header className="ph">
      {/* Avatar */}
      <div className="ph__avatar-wrap">
        <img src={avatarSrc} alt={name} className="ph__avatar" loading="lazy" />
      </div>

      {/* Right side */}
      <div className="ph__info">

        {/* Row 1: username + buttons */}
        <div className="ph__row1">
          <h2 className="ph__username">{username || name}</h2>

          {isOwnProfile ? (
            <button className="ph__btn ph__btn--edit" onClick={onEditClick}>
              Edit profile
            </button>
          ) : (
            <button
              className={`ph__btn ${isFollowing ? "ph__btn--unfollow" : "ph__btn--follow"}`}
              onClick={onFollowClick}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Row 2: stats */}
        <ProfileStats
          postsCount={postsCount}
          followersCount={followersCount}
          followingCount={followingCount}
        />

        {/* Row 3: name + bio */}
        {name && <p className="ph__name">{name}</p>}
        {bio   && <p className="ph__bio">{bio}</p>}
      </div>
      
    </header>

  );
};

export default memo(ProfileHeader);