const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload.middleware");
const { uploadSong, getSong, toggleFav, getFav } = require("../controllers/song.controller");
const authmiddleware = require("../middlewares/auth.middleware");

router.post("/upload", upload.single("song"), uploadSong);
router.post('/fav/:id', authmiddleware, toggleFav)
router.get('/fav', authmiddleware, getFav)
router.get("/song", getSong);

module.exports = router;