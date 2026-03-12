import React, { useRef, useEffect, useState } from "react";
import { useSong } from "../../home/hooks/useSong";
import { Heart, Volume2, Shuffle, RotateCcw, RotateCw, Pause, Play } from "lucide-react";
import "../../home/style/Player.scss";
import { useFav } from "../hooks/useFav";

const Player = () => {
  const { song, isPlaying, togglePlayPause } = useSong();
  const { toggleFav, isFav } = useFav();
  const audioRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);


  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, song]); 


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    
    setCurrentTime(time);
    setDuration(dur || 0); // Handle NaN if duration not loaded yet
    
    if (dur) setProgress((time / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const seek = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;

    audioRef.current.currentTime = seekTime;
    setProgress(percent * 100);
    setCurrentTime(seekTime);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
  };

  const format = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = ("0" + Math.floor(t % 60)).slice(-2);
    return `${m}:${s}`;
  };

  if (!song) return null;

  const songId = song._id || song.videoId;
  const isLiked = isFav(songId);

  return (
    <div className="player">
      <audio 
        ref={audioRef} 
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="player-left">
        <div className="cover-wrapper">
          <img src={song.posterUrl} alt="cover" className="cover" />
          
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
            <p className="title">{song.title.slice(0, 20)}</p>
            <p className="mood">{song.artist}</p>
            <p>{song.mood}</p>
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
            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: "3px" }}/>}
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
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Player;