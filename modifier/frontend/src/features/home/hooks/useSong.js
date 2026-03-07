import { getSong } from "../services/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
    const { currentSong, setCurrentSong, recommendations, setRecommendations, loading, setLoading } = useContext(SongContext);

    const handleGetSong = async (mood) => {
        if (!mood) return;
        setLoading(true)
        try {
            const data = await getSong({ mood: mood.toLowerCase() })
            const songs = data.songs || []
            setRecommendations(songs)
            if (songs.length > 0) setCurrentSong(songs[0])
        } catch (err) {
            console.error("mood Fetch Error: ", err);
        } finally {
            setLoading(false);
        }
    }


    return { song: currentSong, 
    recommendations, 
    handleGetSong, 
    loading,
    setSong: setCurrentSong };
};