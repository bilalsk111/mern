const axios = require("axios");

async function getSongsByMood(req, res) {
  try {

    const mood = (req.query.mood || "neutral").toLowerCase();

    const moodMap = {

      happy: "latest bollywood happy official video -lofi -jukebox",
      sad: "arijit singh sad official video -slowed",
      calm: "soothing bollywood acoustic song",
      neutral: "chill bollywood song official video",
      angry: "bollywood rock official music video",
      surprise: "latest hindi party official video",

      romantic: "bollywood romantic love song official video",
      energetic: "bollywood dance hit song official video",
      focus: "instrumental focus study music",
      party: "bollywood party anthem official video"

    };

    const query =
      mood === "all"
        ? "latest bollywood official music video"
        : moodMap[mood] || "latest bollywood song";

    const { data } = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          maxResults: 20,
          type: "video",
          videoCategoryId: "10",
          relevanceLanguage: "hi",
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    const songs = data.items.map((item) => {

      const title = item.snippet.title
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/Official Video|Music Video|Full Video/gi, "")
        .trim();

      return {
        videoId: item.id.videoId,
        title,
        artist: item.snippet.channelTitle.replace(" - Topic", ""),
        posterUrl: item.snippet.thumbnails.high.url,
        mood
      };

    });

    res.json({ songs });

  } catch (error) {

    console.log("YT API ERROR:", error.message);
    res.status(500).json({ error: error.message });

  }
}

module.exports = { getSongsByMood };