import React, { useRef, useState, useEffect } from "react";
import { useSong } from "../../home/hooks/useSong";
import {
  Heart,
  Volume2,
  Repeat,
  Shuffle,
  RotateCcw,
  RotateCw,
} from "lucide-react";

import "../../home/style/Player.scss";
import { useContext } from "react";

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

    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();

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

  const format = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const back5 = () => {
    audioRef.current.currentTime -= 5;
  };

  const forward5 = () => {
    audioRef.current.currentTime += 5;
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* LEFT */}
      <div className="player-left">
        <img
          src={song.posterUrl || "/default-cover.png"}
          alt="cover"
          className="cover"
        />
        <div className="meta">
          <p className="title">{song.title}</p>
          <p className="mood">{song.mood}</p>
        </div>
        <Heart className="like" size={18} />
      </div>

      {/* CENTER */}
      <div className="player-center">
        <div className="controls">
          <Shuffle size={18} />

          <button onClick={back5}>
            <RotateCcw size={22} />
            <span>5</span>
          </button>

          <button className="play" onClick={togglePlay}>
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button onClick={forward5}>
            <RotateCw size={22} />
            <span>5</span>
          </button>

          <Repeat size={18} />
        </div>

        <div className="progress-wrapper">
          <span>{format(audioRef.current?.currentTime)}</span>

          <div className="progress" onClick={seek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <span>{format(audioRef.current?.duration)}</span>
        </div>
      </div>

      {/* RIGHT */}
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
