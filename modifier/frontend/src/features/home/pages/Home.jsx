import React from 'react';
import FaceExpression from '../../Expression/components/FaceExpression';
import Player from '../../home/components/Player';
import { useSong } from '../hooks/useSong';
import { LayoutGrid, Search, User } from 'lucide-react';

const Home = () => {
  const { handleGetSong, recommendations, loading, song, setSong } = useSong();

  return (
    <div className="home-layout">
      <main className="bento-container">
        <aside className="scanner-card-wrapper">
          <FaceExpression onClick={handleGetSong} />
        </aside>
{/* 
        <section className="recommendation-view">
          {loading ? <p>Tuning into your vibes...</p> : (
            <div className="song-grid">
              {recommendations.map(item => (
                <div 
                  key={item._id} 
                  className={`song-card ${song?._id === item._id ? 'active' : ''}`}
                  onClick={() => setSong(item)}
                >
                  <img src={item.posterUrl} alt={item.title} />
                  <div className="info">
                    <h4>{item.title}</h4>
                    <span>{item.artist}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section> */}
      </main>

      <footer className="player-dock"><Player /></footer>
    </div>
  );
};

export default Home