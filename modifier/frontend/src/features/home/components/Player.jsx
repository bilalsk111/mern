import React, { useRef, useEffect, useState } from "react";
import { useSong } from "../../home/hooks/useSong";
import { Heart, Volume2, Shuffle, RotateCcw, RotateCw, Pause, Play } from "lucide-react";
import "../../home/style/Player.scss";
import { useFav } from "../hooks/useFav";

const Player = () => {
  const { song, isPlaying, togglePlayPause } = useSong();
  const { toggleFav, isFav } = useFav();
  const playerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!song) return;

    const createPlayer = () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player("youtube-player-target", {
        videoId: song.videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            const dur = event.target.getDuration();
            setDuration(dur);
            event.target.setVolume(volume * 100);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
  }, [song]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (typeof playerRef.current.playVideo !== "function") return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!playerRef.current) return;
      if (typeof playerRef.current.getCurrentTime !== "function") return;
      if (isPlaying) {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();

        setCurrentTime(time);
        setDuration(dur);

        if (dur) setProgress((time / dur) * 100);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const seek = (e) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== "function") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;

    playerRef.current.seekTo(seekTime, true);
    setProgress(percent * 100);
    setCurrentTime(seekTime);
  };

  const skipBackward = () => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
    const time = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(time - 5, 0), true);
  };

  const skipForward = () => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
    const time = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(time + 5, true);
  };

  const changeVolume = (v) => {
    setVolume(v);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(v * 100);
    }
  };

  const format = (t) => {
    if (!t) return "0:00";
    const m = Math.floor(t / 60);
    const s = ("0" + Math.floor(t % 60)).slice(-2);
    return `${m}:${s}`;
  };

  if (!song) return null;

  const songId = song._id || song.videoId;
  const isLiked = isFav(songId);

  return (
    <div className="player">
      <div style={{ display: "none" }}>
        <div id="youtube-player-target"></div>
      </div>

      {/* TOP SECTION: Cover & Meta */}
      <div className="player-left">
        <div className="cover-wrapper">
          <img src={song.posterUrl} alt="cover" className="cover" />
          
          {/* Heart button mapped properly over image */}
          <button
            className={`favorite-btn ${isLiked ? "liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(song);
            }}
          >
            <Heart
              size={20}
              color={isLiked ? "var(--accent-like)" : "white"}
              fill={isLiked ? "var(--accent-like)" : "none"}
            />
          </button>
        </div>

        <div className="meta">
          <div className="info-text">
            <p className="title">{song.title}</p>
            <p className="mood">{song.artist || song.mood}</p>
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Progress & Controls */}
      <div className="player-center">
        <div className="progress-wrapper">
          <span>{format(currentTime)}</span>
          <div className="progress" onClick={seek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{format(duration)}</span>
        </div>

        <div className="controls">
          <Shuffle size={20} />
          <button onClick={skipBackward}>
            <RotateCcw size={22} />
          </button>
          <button className="play" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: "3px" }}/>}
          </button>
          <button onClick={skipForward}>
            <RotateCw size={22} />
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: Volume */}
      <div className="player-right">
        <Volume2 size={18} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Player;