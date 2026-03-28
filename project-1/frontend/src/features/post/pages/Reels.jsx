import React, { useEffect, useRef, useState } from "react";
import SingleReel from "../components/SingleReel";
import '../../post/style/Reels.scss';
import { usePost } from "../hook/usePost";

const Reels = ({ currentUser }) => {
  const { feed, handleGetFeed, loading } = usePost();
  const containerRef = useRef(null);

  useEffect(() => {
    handleGetFeed(true);
  }, []);
  if (loading) return <div className="loading">Loading reels...</div>;

  return (
    <div className="reels-page" ref={containerRef}>
        {feed
        ?.filter((item) => item.mediaType === "video")
        .map((reel) => (
          <SingleReel
            key={reel._id}
            reel={reel}
            currentUser={currentUser}
            fetchReels={() => handleGetFeed(true)}
          />
        ))}
    </div>
  );
};

export default Reels;