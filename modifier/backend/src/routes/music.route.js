const express = require("express");
const { getSongsByMood } = require("../controllers/saavn.controller");

const router = express.Router();

router.get("/song", getSongsByMood);

module.exports = router;