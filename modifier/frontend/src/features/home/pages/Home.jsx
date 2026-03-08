import React from "react";
import FaceExpression from "../../Expression/components/FaceExpression";
import { useSong } from "../hooks/useSong";
import { Sparkles, Activity, Music } from "lucide-react";
import Player from "../../home/components/Player";
import "../style/Home.scss";
import { useAuth } from "../../auth/hooks/useAuth";

const Home = () => {
  const {user} = useAuth()
  const { handleGetSong, recommendations, loading, song, setSong } = useSong();

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="header">
        <div>
          <div className="badge">✨ AI PERSONALIZATION</div>
          <h1>
            hy,<span>{user?.username}</span>
          </h1>
          <p>Scan your face to generate mood-based music</p>
        </div>
        <div className="engine-status">
          <Activity size={14} className="pulse-icon" />
          AI Engine Ready
        </div>
      </header>

   <section className="top-grid">

  <div className="card scanner-card-wrapper">
    <FaceExpression onClick={handleGetSong} />
  </div>

  <div className="card player-card">

    <div className="card-title">
      <Sparkles size={18} />
      <h3>Now Playing</h3>
    </div>

    <Player />

    {!song && (
      <div className="empty-player">
        <p>No track selected. Scan your mood to start.</p>
      </div>
    )}

  </div>

</section>

      {/* RECOMMENDATIONS */}
      <section className="card songs-section">
        <div className="card-title">
          <Music size={18} />
          <h3>Recommended For You</h3>
        </div>

    
          <div className="song-grid">
            {recommendations.map((item) => (
              <div
                key={item._id}
                className={`song-card ${song?._id === item._id ? "active" : ""}`}
                onClick={() => setSong(item)}
              >
                <img src={item.posterUrl} alt={item.title} />
                <div className="overlay" />
                <div className="song-info">
                  <h4>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
      </section>
    </div>
  );
};

export default Home;