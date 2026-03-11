import { createContext, useContext, useState } from "react";

const FavContext = createContext();

export const FavProvider = ({ children }) => {

  const [fav, setFav] = useState(() => {
    const saved = localStorage.getItem("favsongs");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleLocalFav = (song) => {

    const songId = song._id || song.videoId;

    const exists = fav.find(
      (s) => (s._id || s.videoId) === songId
    );

    let updated;

    if (exists) {
      updated = fav.filter(
        (s) => (s._id || s.videoId) !== songId
      );
    } else {
      updated = [...fav, song];
    }

    setFav(updated);
    localStorage.setItem("favsongs", JSON.stringify(updated));

    return !exists;
  };

  return (
    <FavContext.Provider value={{ fav, toggleLocalFav }}>
      {children}
    </FavContext.Provider>
  );
};

export const useFavStore = () => useContext(FavContext);