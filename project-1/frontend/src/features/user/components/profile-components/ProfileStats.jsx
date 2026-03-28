import React, { memo } from "react";

const ProfileStats = ({ postsCount = 0, followersCount = 0, followingCount = 0 }) => (
  <div className="ps">
    <button className="ps__stat">
      <span className="ps__num">{postsCount.toLocaleString()}</span>
      <span className="ps__label">posts</span>
    </button>
    <button className="ps__stat">
      <span className="ps__num">{followersCount.toLocaleString()}</span>
      <span className="ps__label">followers</span>
    </button>
    <button className="ps__stat">
      <span className="ps__num">{followingCount.toLocaleString()}</span>
      <span className="ps__label">following</span>
    </button>
  </div>
);

export default memo(ProfileStats);