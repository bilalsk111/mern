const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({

  url: {
    type: String,
    required: true
  },

  posterUrl: {
    type: String,
    default: null
  },

  title: {
    type: String,
    required: true
  },

  year: {
    type: String,
    required: true
  },

  artist: {
    type: String,
    required: true
  },

  mood: {
    type: String,
    enum: [
      "happy",
      "sad",
      "neutral",
      "calm",
      "angry",
      "surprise",
      "romantic",
      "energetic",
      "focus",
      "party"
    ],
    required: true
  }

});

const songModel = mongoose.model("songs", songSchema);

module.exports = songModel;