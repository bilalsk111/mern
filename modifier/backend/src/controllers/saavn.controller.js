const axios = require("axios");

const moodMap = {
  happy: "dance remix",
  sad: "slowed",
  calm: "lofi",
  neutral: "unplugged",
  angry: "bass boosted",
  surprise: "viral",
  romantic: "romantic hindi",
  energetic: "gym",
  focus: "instrumental",
  party: "dj party",
};

function formatSongs(results, mood) {
  return results
    .map((item) => {
      const imageArray = item.image || [];
      const image =
        imageArray.find((i) => i.quality === "500x500") ||
        imageArray[imageArray.length - 1] ||
        {};

      const audioArray = item.downloadUrl || [];
      const audio =
        audioArray.find((a) => a.quality === "320kbps") ||
        audioArray[audioArray.length - 1] ||
        {};

      let artistName = "Unknown Artist";
      if (
        typeof item.primaryArtists === "string" &&
        item.primaryArtists.trim()
      ) {
        artistName = item.primaryArtists;
      } else if (item.artists && Array.isArray(item.artists.primary)) {
        artistName = item.artists.primary.map((a) => a.name).join(", ");
      } else if (item.artists && typeof item.artists === "string") {
        artistName = item.artists;
      }

      return {
        _id: item.id,
        videoId: item.id,
        title:
          item.name?.replace(/&quot;/g, '"').replace(/&#39;/g, "'") ||
          "Unknown Title",
        artist: artistName,
        posterUrl: image.link || image.url || "",
        audioUrl: audio.link || audio.url || "",
        mood,
      };
    })
    .filter((song) => song.audioUrl);
}

async function fetchSongs(query, mood) {
  const API_URL =
    process.env.SAAVN_API || "https://saavn.sumit.co/api/search/songs";
  const { data } = await axios.get(API_URL, { params: { query, limit: 40 } });
  const results = data?.data?.results || [];
  return formatSongs(results, mood);
}

async function getSongsByMood(req, res) {
  try {
    const mood = (req.query.mood || "neutral").toLowerCase();
    let query = mood === "all" ? "latest bollywood hit" : "latest hindi songs";

    if (moodMap[mood]) {
      const keywords = moodMap[mood];
      query = keywords[Math.floor(Math.random() * keywords.length)];
    }

    let songs = await fetchSongs(query, mood);

    if (songs.length < 5) {
      const fallbackQuery =
        mood === "sad" ? "sad hindi mashup" : "trending hindi mashup";
      songs = [...songs, ...(await fetchSongs(fallbackQuery, mood))].slice(
        0,
        40,
      );
    }

    res.json({ songs });
  } catch (error) {
    console.error("SAAVN API ERROR:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch songs", details: error.message });
  }
}

module.exports = { getSongsByMood };
