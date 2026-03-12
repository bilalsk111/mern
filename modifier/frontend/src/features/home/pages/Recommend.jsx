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
import Player from "../../home/components/Player"; 
import "../../home/style/Recommend.scss";
import { useFav } from "../hooks/useFav";

const moods = [
   "Neutral",
  "Happy",
  "Sad",
  "Calm",
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

  const activeSongId = currentSong?._id || currentSong?.videoId;

  useEffect(() => {
    handleGetSong("neutral");
  }, []);

  const handleCardClick = (item) => {
    const itemId = item._id || item.videoId;
    // STRICT CHECK: Dono ID valid honi chahiye aur match karni chahiye
    const isSameSong = activeSongId && activeSongId === itemId; 

    if (isSameSong) {
      togglePlayPause();
    } else {
      setSong(item);
      if (setIsPlaying) setIsPlaying(true); 
    }
  };

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

      {loading ? (
        <div className="loader-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="music-grid">
          {recommendations.map((item, index) => {
            const itemId = item._id || item.videoId;
            const isSelected = activeSongId && activeSongId === itemId;

            return (
              <div
                key={itemId || index}
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
                      toggleFav(item); 
                    }}
                  >
                    <Heart
                      size={18}
                      color={isFav(itemId) ? "red" : "gray"}
                      fill={isFav(itemId) ? "red" : "none"}
                    />
                  </button>
                </div>

                <div className="text-area">
                  <h4>{item.title}</h4>
                  <div className="artist-row">
                    <span>{item.title.slice(0, 20)}</span>
                    <MoreVertical size={16} className="more-icon" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentSong && (
        <div className="floating-player-wrapper">
          <Player />
        </div>
      )}
    </div>
  );
};

export default Recommend;