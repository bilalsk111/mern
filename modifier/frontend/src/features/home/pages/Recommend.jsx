import React, { useState, useEffect } from "react";
import { useSong } from "../hooks/useSong";
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Headphones,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import Player from "../../home/components/Player"; // Player import kiya
import "../../home/style/Recommend.scss";
import { useFav } from "../hooks/useFav";

const moods = [
  "All",
  "Happy",
  "Sad",
  "Calm",
  "Neutral",
  "Angry",
  "Surprise",
  "Romantic",
  "Energetic",
  "Focus",
  "Party",
];

const Recommend = () => {
  const {
    recommendations,
    song: currentSong,
    handleGetSong,
    loading,
    setSong,
    togglePlayPause,
    isPlaying,
    setIsPlaying,
  } = useSong();

  const [activeFilter, setActiveFilter] = useState("All");
  const { toggleFav, isFav } = useFav();

  useEffect(() => {
    handleGetSong("neutral");
  }, []);

  const handleCardClick = (item) => {
    const isSameSong = currentSong?.videoId === item.videoId;
    if (isSameSong) {
      togglePlayPause();
    } else {
      setSong(item);
      if (setIsPlaying) setIsPlaying(true); // Naya song aate hi play karega
    }
  };

  /* FILTER LOGIC */
  const handleFilter = (mood) => {
    setActiveFilter(mood);
    if (mood === "All") {
      handleGetSong("neutral");
    } else {
      handleGetSong(mood.toLowerCase());
    }
  };

  return (
    <div className="recommend-container">
      {/* HEADER SECTION */}
      <header className="recommend-header">
        <div className="welcome-section">
          <span className="subtitle">AI Curated Picks</span>
          <h1>
            Recommended <span>Songs</span>
          </h1>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <div className="icon-ring blue">
              <Headphones size={20} />
            </div>
            <div>
              <h3>{recommendations?.length || 0}</h3>
              <p>Songs Available</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="icon-ring purple">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3>{moods.length - 1}</h3>
              <p>Mood Categories</p>
            </div>
          </div>
        </div>
      </header>

      {/* FILTER NAV */}
      <nav className="mood-nav">
        <div className="nav-header">
          <BarChart3 size={16} /> FILTER BY MOOD
        </div>
        <div className="chip-container">
          {moods.map((mood) => (
            <button
              key={mood}
              className={`mood-chip ${activeFilter === mood ? "active" : ""}`}
              onClick={() => handleFilter(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="loader-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="music-grid">
          {recommendations.map((item) => {
            const isSelected = currentSong?.videoId === item.videoId;
            return (
              <div
                key={item.videoId}
                className={`music-card ${isSelected ? "is-active" : ""}`}
                onClick={() => handleCardClick(item)}
              >
                <div className="artwork-area">
                  <img src={item.posterUrl} alt={item.title} />

                  <div className="mood-tag">{item.mood || activeFilter}</div>

                  <div
                    className={`interaction-overlay ${isSelected && isPlaying ? "force-visible" : ""}`}
                  >
                    <div className="main-action">
                      {isSelected && isPlaying ? (
                        <Pause size={28} color="white" fill="white" />
                      ) : (
                        <Play
                          size={28}
                          color="white"
                          fill="white"
                          className="play-icon"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(item); // Pura item pass karein
                    }}
                  >
                    <Heart
                      size={18}
                      // FIX: dono me se jo id available ho wo pass karein
                      color={isFav(item._id || item.videoId) ? "red" : "gray"}
                      fill={isFav(item._id || item.videoId) ? "red" : "none"}
                    />
                  </button>
                </div>

                <div className="text-area">
                  <h4>{item.title}</h4>
                  <div className="artist-row">
                    <span>{item.artist}</span>
                    <MoreVertical size={16} className="more-icon" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING PLAYER (Only shows when a song is selected) */}
      {currentSong && (
        <div className="floating-player-wrapper">
          <Player />
        </div>
      )}
    </div>
  );
};

export default Recommend;
