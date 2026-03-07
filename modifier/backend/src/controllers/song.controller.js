const favModel = require("../models/fav.model")
const songModel = require("../models/song.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")


async function uploadSong(req, res) {
    try {
        const songBuffer = req.file.buffer
        const { mood } = req.body

        // Read only required ID3 tags
        const tags = id3.read(songBuffer)
        const title = tags.title || "Unknown Title"
        const artist = tags.artist || "Unknown Artist"
        const year = tags.year || new Date().getFullYear()

        // Upload song & poster in parallel
        const [songFile, posterFile] = await Promise.all([
            storageService.uploadFile({
                buffer: songBuffer,
                filename: `${title}.mp3`,
                folder: "/cohort-2/moodify/songs"
            }),
            storageService.uploadFile({
                buffer: tags.image?.imageBuffer,
                filename: `${title}.jpeg`,
                folder: "/cohort-2/moodify/posters"
            })
        ])

        // Create song in DB
        const song = await songModel.create({
            title,
            year,
            artist,
            url: songFile.url,
            posterUrl: posterFile?.url,
            mood
        })

        res.status(201).json({
            message: "Song created successfully",
            song
        })
    } catch (error) {
        console.error("Upload song error:", error)
        res.status(500).json({ message: "Failed to upload song", error: error.message })
    }
}
async function getSong(req, res) {
    try {
        const { mood } = req.query;
        let query = {};
        if (mood && mood !== 'all') {
            query.mood = mood.toLowerCase();
        }
        const songs = await songModel.find(query);

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: "No songs found for this mood." });
        }

        res.status(200).json({
            message: "songs fetched successfully.",
            songs,
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}
const toggleFav = async (req, res) => {
    try {
        const userId = req.user.id;
        const songId = req.params.id;
        if (!userId || !songId) {
            return res.status(400).json({
                message: "User or Song ID missing",
                received: { userId, songId }
            });
        }

        const existingFav = await favModel.findOne({ user: userId, song: songId });

        if (existingFav) {
            await favModel.deleteOne({ _id: existingFav._id });
            return res.status(200).json({ message: "Removed from favorites", isSaved: false });
        }

        await favModel.create({
            user: userId,
            song: songId
        });

        res.status(201).json({ message: "Added to favorites", isSaved: true });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
async function getFav(req, res) {
    try {
        const userId = req.user.id

        const fav = await favModel.find({ user: userId }).populate('song')
        res.status(200).json({
            success: true,
            fav
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching favorites" });
    }
}

module.exports = { uploadSong, getSong, toggleFav, getFav }