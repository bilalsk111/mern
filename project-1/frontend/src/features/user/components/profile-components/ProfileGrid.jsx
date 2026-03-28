import React from "react";
import { Grid3x3, Play } from "lucide-react";

const ProfileGrid = ({ posts }) => {
  if (!posts?.length) {
    return (
      <div className="pg-empty">
        <div className="pg-empty__icon">
          <Grid3x3 size={40} strokeWidth={1.2} />
        </div>
        <h3 className="pg-empty__title">No Posts Yet</h3>
        <p className="pg-empty__sub">When you share photos, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="pg">
      {posts.map((post) => (
        <div key={post._id} className="pg__item">
          {post.mediaType === "video" ? (
            <>
              <video src={post.mediaUrl} className="pg__media" preload="metadata" />
              <div className="pg__video-badge">
                <Play size={14} fill="white" color="white" />
              </div>
            </>
          ) : (
            <img src={post.mediaUrl} alt="" className="pg__media" loading="lazy" />
          )}
          {/* Hover overlay */}
          <div className="pg__overlay" />
        </div>
      ))}
    </div>
  );
};

export default ProfileGrid;