import React, { useRef, useState, useEffect } from "react";
import { useSong } from "../../home/hooks/useSong";
import {
  Heart,
  Volume2,
  Repeat,
  Shuffle,
  RotateCcw,
  RotateCw,
  Volume1,
} from "lucide-react";
import "../../home/style/Player.scss";

const Player = () => {
  const { song } = useSong();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    if (song) {
      setIsPlaying(false);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [song]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!song) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((current / duration) * 100 || 0);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  // FIX: Forward & Backward Functions
  const skipForward = () => {
    if (audioRef.current) audioRef.current.currentTime += 5;
  };

  const skipBackward = () => {
    if (audioRef.current) audioRef.current.currentTime -= 5;
  };

  const format = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // SHORT TRICK: Artist name clean karne ke liye (Sirf pehla naam dikhayega)
  const cleanArtist = song.artist 
    ? song.artist
    : song.mood;

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="player-header">
        <Volume2 size={18} />
        <span>Now Playing</span>
      </div>

      <div className="player-left">
        <div className="cover-wrapper">
          <img
            src={song.posterUrl || "/default-cover.png"}
            alt="cover"
            className="cover"
          />
          {isPlaying && (
            <div className="visualizer-overlay">
               <div className="playing-bars white"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        
        <div className="meta">
          <div className="info-text">
            <p className="title">{song.title}</p>
            <p className="mood">{song.artist || song.mood}</p>
          </div>
          <Heart className="like" size={20} />
        </div>
      </div>

      <div className="player-center">
        <div className="progress-wrapper">
          <span>{format(audioRef.current?.currentTime)}</span>
          <div className="progress" onClick={seek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{format(audioRef.current?.duration)}</span>
        </div>

        <div className="controls">
          {/* FIX: onClick added here */}
          <button onClick={skipBackward}><RotateCcw size={20} /></button>
          
          <button className="play" onClick={togglePlay}>
            {isPlaying ? "❚❚" : "▶"}
          </button>
          
          {/* FIX: onClick added here */}
          <button onClick={skipForward}><RotateCw size={20} /></button>
        </div>
      </div>

      <div className="player-right">
        <Volume1 size={16} />
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