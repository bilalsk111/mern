import React, { useState, useEffect, useRef } from "react";
import { usePost } from "../hook/usePost";
import { useFollow } from "../../user/hooks/useFollow";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  Heart, MessageCircle, Send, Bookmark,
  MoreVertical, Volume2, VolumeX, Play,
} from "lucide-react";
import { Link } from "react-router-dom";

const SingleReel = ({ reel }) => {
  const { handleToggleLike, handleToggleSave } = usePost();
  const { handleFollow, handleUnfollow } = useFollow();
  const { user: currentUser } = useAuth();

  const videoRef = useRef(null);
  const clickTimeout = useRef(null);

  const [showHeart, setShowHeart] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [following, setFollowing] = useState(reel?.user?.isFollowing || false);
  const [followLoading, setFollowLoading] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const isOwner =
    currentUser?._id &&
    reel?.user?._id &&
    String(currentUser._id) === String(reel.user._id);

  useEffect(() => {
    setFollowing(reel?.user?.isFollowing || false);
  }, [reel]);

  // Intersection Observer for auto-play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMainClick = () => {
    if (clickTimeout.current) {
      // DOUBLE CLICK → LIKE
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (!reel.isLiked) handleToggleLike(reel._id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    } else {
      // SINGLE CLICK → PLAY/PAUSE
      clickTimeout.current = setTimeout(() => {
        togglePlay();
        clickTimeout.current = null;
      }, 250);
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const onLikeClick = (e) => {
    e.stopPropagation();
    handleToggleLike(reel._id);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
  };

  const onFollowClick = async (e) => {
    e.stopPropagation();
    if (followLoading || isOwner) return;
    const username = reel.user?.username;
    if (!username) return;

    const prev = following;
    setFollowing(!prev);
    setFollowLoading(true);

    try {
      const res = prev ? await handleUnfollow(username) : await handleFollow(username);
      if (!res) setFollowing(prev);
    } catch {
      setFollowing(prev);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="reel-item">
      {/* Video Container */}
      <div className="reel-video-container" onClick={handleMainClick}>
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          loop
          muted={muted}
          playsInline
          onTimeUpdate={onTimeUpdate}
          className="reel-video"
        />

        {/* Big Play Overlay */}
        {!isPlaying && (
          <div className="play-overlay">
            <Play size={60} fill="white" color="white" />
          </div>
        )}

        {/* Double Tap Heart */}
        {showHeart && (
          <div className="heart-overlay">
            <Heart size={100} fill="#ff3040" stroke="none" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="reel-progress">
        <div className="reel-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Mute Button */}
      <button className="mute-control-btn" onClick={toggleMute}>
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Right Sidebar Actions */}
      <div className="reel-actions">
        <div className="action-group">
          <button onClick={onLikeClick} className={`action-btn ${likeAnim ? "like-pop" : ""}`}>
            <Heart size={30} fill={reel?.isLiked ? "#ff3040" : "none"} stroke={reel?.isLiked ? "#ff3040" : "white"} strokeWidth={2} />
            <span className="action-count">{reel?.totalLikes || 0}</span>
          </button>

          <button className="action-btn">
            <MessageCircle size={30} color="white" strokeWidth={2} />
            <span className="action-count">{reel?.totalComments || 0}</span>
          </button>

          <button className="action-btn share-icon">
            <Send size={28} color="white" strokeWidth={2} />
          </button>

          <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleToggleSave(reel._id); }}>
            <Bookmark size={28} fill={reel?.isSaved ? "white" : "none"} color="white" strokeWidth={2} />
          </button>

          <button className="action-btn">
            <MoreVertical size={24} color="white" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="reel-footer">
        <div className="user-info">
          <Link to={`/profile/${reel.user?.username}`} className="avatar-ring">
            <img src={reel.user?.profileImage || "/default-avatar.png"} alt="" className="user-avatar" />
          </Link>
          <Link to={`/profile/${reel.user?.username}`} className="username">
            {reel.user?.username}
          </Link>
          {!isOwner && (
            <button className={`follow-btn ${following ? "is-following" : ""}`} onClick={onFollowClick} disabled={followLoading}>
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <p className={`caption ${captionExpanded ? "expanded" : ""}`} onClick={() => setCaptionExpanded(!captionExpanded)}>
          {reel.caption}
        </p>
      </div>
    </div>
  );
};

export default SingleReel;