const express = require('express')
const path = require('path')
const app = express();
const cookieParser = require('cookie-parser')
const cors = require('cors')

app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use(cookieParser())
app.use(cors({
  origin: true, 
  credentials: true, 
}))

const authRouter = require('./routes/auth.route')
const songrouter = require('./routes/song.route')
const musicRouter = require("./routes/music.route");

const distPath = path.join(__dirname, "../pubilc");


app.use('/api/auth',authRouter)
app.use('/api/songs',songrouter)
app.use("/api/music", musicRouter);
app.use(express.static(distPath));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});



module.exports = app