import { createContext, useState } from "react";

export const SongContext = createContext();

export const SongProvider = ({ children }) => {

  const [currentSong, setCurrentSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SongContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        recommendations,
        setRecommendations,
        loading,
        setLoading,
        isPlaying,
        setIsPlaying
      }}
    >
      {children}
    </SongContext.Provider>
  );
};