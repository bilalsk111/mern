import { useFavStore } from "../fav.context";
import { togglefav } from "../services/song.api";

export const useFav = () => {
  const { fav, toggleLocalFav } = useFavStore();

  const toggleFav = async (song) => {
    toggleLocalFav(song);

    try {
      await togglefav(song._id); 
    } catch (err) {
      console.error("Fav API error", err);
    }
  };

const isFav = (id) => {
  if (!id) return false;
  
  return fav.some((s) => {
    const savedId = s._id || s.videoId; 
    return savedId === id;
  });
};

  return { fav, toggleFav, isFav };
};