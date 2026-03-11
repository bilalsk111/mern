import { useContext } from "react";
import { SongContext } from "../song.context";
import { getSong } from "../services/song.api";

export const useSong = () => {

  const {
    currentSong,
    setCurrentSong,
    recommendations,
    setRecommendations,
    loading,
    setLoading,
    isPlaying,
    setIsPlaying
  } = useContext(SongContext);

  const handleGetSong = async (mood) => {

    setLoading(true);

    try {

      const data = await getSong({ mood });

      const songs = data.songs || [];

      setRecommendations(songs);

      if (songs.length > 0) {
        setCurrentSong(songs[0]);
        setIsPlaying(true);
      }

    } catch (err) {

      console.error("Mood Fetch Error:", err);

    } finally {

      setLoading(false);

    }

  };

  const setSongAndPlay = (song) => {

    setCurrentSong(song);
    setIsPlaying(true);

  };

const togglePlayPause = () => {
  setIsPlaying(prev => !prev);
};

  return {
  song: currentSong,
  recommendations,
  handleGetSong,
  loading,
  setSong: setCurrentSong,
  setSongAndPlay,
  togglePlayPause,
  isPlaying
  };

};