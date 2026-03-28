import React, { useState, useEffect, useRef } from "react";
import { usePost } from "../hook/usePost";
import { useFollow } from "../../user/hooks/useFollow"; // Imported Follow Hook
import {
  Send,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Play,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

const Post = ({ user, post, currentUser }) => {
  const { handleToggleLike, handleToggleSave, handleDeletePost } = usePost();
  const { handleFollow, handleUnfollow } = useFollow(); // Follow Logic

  // State Management
  const [showHeart, setShowHeart] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [progress, setProgress] = useState(0);


  const [following, setFollowing] = useState(user?.isFollowing || false);
  const [followLoading, setFollowLoading] = useState(false);

  const menuRef = useRef(null);
  const videoRef = useRef(null);

  const isVideo = post?.mediaType === "video";

  const isOwner =
    currentUser?._id &&
    post?.user?._id &&
    String(currentUser._id) === String(post.user._id);

  const CAPTION_LIMIT = 100;
  const longCaption = (post?.caption?.length || 0) > CAPTION_LIMIT;

 
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.7 }, // High threshold for "Reel" feel
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isVideo]);

 
  const onTimeUpdate = () => {
    if (videoRef.current) {
      const percentage =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const onFollowClick = async (e) => {
    e.stopPropagation();
    if (followLoading || isOwner) return;

    const username = user?.username;
    if (!username) return;

    const wasFollowing = following;
    setFollowLoading(true);
    setFollowing(!wasFollowing);

    try {
      const result = wasFollowing
        ? await handleUnfollow(username)
        : await handleFollow(username);
      if (!result) setFollowing(wasFollowing);
    } catch (err) {
      setFollowing(wasFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDoubleTap = () => {
    if (!post?.isLiked) onLikeClick();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };


  const onLikeClick = () => {
    handleToggleLike(post?._id);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 500);
  };


  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuteStatus = !videoRef.current.muted;
    videoRef.current.muted = newMuteStatus;
    setIsMuted(newMuteStatus);
  };

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <article className="ig-post">
        <header className="ig-post__header">
          <Link
            to={`/profile/${user?.username}`}
            className="ig-post__avatar-wrap"
          >
            <img
              src={user?.profileImage || "/default-avatar.png"}
              alt=""
              className="ig-post__avatar"
            />
          </Link>

          <div className="ig-post__meta">
            <div className="ig-post__meta-top">
              <Link
                to={`/profile/${user?.username}`}
                className="ig-post__username"
              >
                {user?.username || "anonymous"}
              </Link>

              {!isOwner && (
                <>
                  <span className="ig-post__sep">•</span>
                  <button
                    disabled={followLoading}
                    className={`ig-post__follow-inline ${following ? "is-following" : ""}`}
                    onClick={onFollowClick}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                </>
              )}
            </div>
            <span className="ig-post__time">2h</span>
          </div>

          <div className="ig-post__more-wrap" ref={menuRef}>
            <button
              className="ig-post__more-btn"
              onClick={() => setMenuOpen((p) => !p)}
            >
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="ig-post__sheet">
                {isOwner && (
                  <button
                    className="ig-post__sheet-btn danger"
                    onClick={() => {
                      setDeleteOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    Delete
                  </button>
                )}
                <button className="ig-post__sheet-btn">Report</button>
                {!isOwner && (
                  <button
                    className="ig-post__sheet-btn"
                    onClick={onFollowClick}
                  >
                    {following ? "Unfollow" : "Follow"}
                  </button>
                )}
                <button
                  className="ig-post__sheet-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="ig-post__media" onDoubleClick={handleDoubleTap}>
          {isVideo ? (
            <div className="ig-post__video-wrap" onClick={toggleMute}>
              <video
                ref={videoRef}
                src={post?.mediaUrl}
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={onTimeUpdate}
                className="ig-post__media-el"
              />

              <div className="ig-post__progress-bar">
                <div
                  className="ig-post__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {!isPlaying && (
                <div className="ig-post__play-overlay">
                  <div className="ig-post__play-circle">
                    <Play size={34} fill="white" color="white" />
                  </div>
                </div>
              )}

              <button className="ig-post__mute-btn" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX size={13} color="white" />
                ) : (
                  <Volume2 size={13} color="white" />
                )}
              </button>
            </div>
          ) : (
            <img
              src={post?.mediaUrl}
              alt="post"
              className="ig-post__media-el"
              loading="lazy"
            />
          )}

          {showHeart && (
            <div className="ig-post__heart-burst">
              <Heart size={80} fill="white" stroke="none" />
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="ig-post__actions">
          <div className="ig-post__actions-left">
            <button
              className={`ig-post__action-btn ${likeAnim ? "pop" : ""}`}
              onClick={onLikeClick}
            >
              <Heart
                size={26}
                fill={post?.isLiked ? "#ff3040" : "none"}
                color={post?.isLiked ? "#ff3040" : "var(--text-main)"}
                strokeWidth={1.8}
              />
            </button>
            <button className="ig-post__action-btn">
              <MessageCircle size={26} strokeWidth={1.8} />
            </button>
            <button className="ig-post__action-btn ig-post__action-btn--send">
              <Send size={24} strokeWidth={1.8} />
            </button>
          </div>

          <button
            className="ig-post__action-btn"
            onClick={() => handleToggleSave(post?._id)}
          >
            <Bookmark
              size={26}
              strokeWidth={1.8}
              fill={post?.isSaved ? "var(--text-main)" : "none"}
              color="var(--text-main)"
            />
          </button>
        </div>

        {/* DETAILS */}
        <div className="ig-post__details">
          <p className="ig-post__likes">
            {(Number(post?.totalLikes) || 0).toLocaleString()} likes
          </p>
          <p className="ig-post__caption">
            <Link
              to={`/profile/${user?.username}`}
              className="ig-post__cap-user"
            >
              {user?.username}
            </Link>{" "}
            {captionExpanded || !longCaption
              ? post?.caption
              : post?.caption?.slice(0, CAPTION_LIMIT)}
            {longCaption && !captionExpanded && (
              <button
                className="ig-post__more-caption"
                onClick={() => setCaptionExpanded(true)}
              >
                … more
              </button>
            )}
          </p>
          <p className="ig-post__timestamp">2 HOURS AGO</p>
        </div>
      </article>

      <ConfirmModal
        isOpen={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await handleDeletePost(post?._id);
          setDeleteOpen(false);
        }}
        title="Delete Post?"
        danger={true}
      />
    </>
  );
};

export default Post;
