import React from "react";
import { useFav } from "../hooks/useFav"
import { useSong } from "../hooks/useSong"; 
import { Heart, Play, Pause, BarChart3, Users, LayoutList } from "lucide-react"; 
import Player from "../../home/components/Player"; // 1. Player import kiya
import "../../home/style/fav.scss";

export default function Favorites() {
  const { fav, toggleFav } = useFav();
  
  const { song: currentSong, setSong, isPlaying, setIsPlaying, togglePlayPause } = useSong();

  const uniqueMoods = new Set(fav.map(s => s.mood)).size;
  const uniqueArtists = new Set(fav.map(s => s.artist)).size;

  const activeSongId = currentSong?._id || currentSong?.videoId;

  const handlePlay = (song) => {
    const songId = song._id || song.videoId;
    const isSameSong = activeSongId && activeSongId === songId; // Strict check

    if (isSameSong) {
      togglePlayPause();
    } else {
      setSong(song);
      if (setIsPlaying) setIsPlaying(true);
    }
  };

  const handleRemove = (song) => {
    toggleFav(song); 
    const songId = song._id || song.videoId;
    if (activeSongId === songId) {
      if (setIsPlaying) setIsPlaying(false);
      setSong(null);
    }
  };

  if (!fav.length) {
    return (
      <div className="fav-empty">
        <Heart size={60} strokeWidth={1} />
        <h2>No favorite songs yet</h2>
        <p>Songs you like will appear here for easy access.</p>

        {currentSong && (
          <div className="floating-player-wrapper">
            <Player />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fav-page">
      {/* HEADER */}
      <header className="fav-header">
        <div className="title-row">
          <Heart size={32} fill="#ff3040" color="#ff3040" />
          <h1>Favorite Songs</h1>
        </div>
        <p>Your personally curated collection • {fav.length} songs</p>
      </header>

      {/* SONGS LIST */}
      <div className="fav-list">
        {fav.map((song, index) => {
          
          const songId = song._id || song.videoId;
          const isSelected = activeSongId && activeSongId === songId;

          return (
            <div className={`fav-row ${isSelected ? "active" : ""}`} key={songId}>
              <div className="index">{index + 1}</div>
              
              <div className="song-details">
                <img src={song.posterUrl} alt={song.title} />
                <div className="meta">
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                </div>
              </div>

              <div className="mood-tag">
                <span>{song.mood || "Neutral"}</span>
              </div>

              <div className="actions">
              <button className="remove-btn" onClick={() => handleRemove(song)} title="Remove from favorites">
                  <Heart size={20} fill="#ff3040" color="#ff3040" />
                </button>

                {/* PLAY / PAUSE BUTTON */}
                <button className="play-btn" onClick={() => handlePlay(song)}>
                  {isSelected && isPlaying ? (
                    <Pause size={18} fill="white" />
                  ) : (
                    <Play size={18} fill="white" style={{ marginLeft: "2px" }} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper"><LayoutList size={20}/></div>
          <div className="stat-info">
            <h3>{fav.length}</h3>
            <p>Total Favorites</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-wrapper"><BarChart3 size={20}/></div>
          <div className="stat-info">
            <h3>{uniqueMoods}</h3>
            <p>Different Moods</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-wrapper"><Users size={20}/></div>
          <div className="stat-info">
            <h3>{uniqueArtists}</h3>
            <p>Unique Artists</p>
          </div>
        </div>
      </div>

      {/* 3. FLOATING PLAYER ADD KIYA */}
      {currentSong && (
        <div className="floating-player-wrapper">
          <Player />
        </div>
      )}
    </div>
  );
}