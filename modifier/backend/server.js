require('dotenv').config()
const app = require('./src/app')
const connectToDB = require('./src/config/database')
const {connectRedis} = require('./src/config/redis')
PORT = process.env.PORT

connectToDB()
connectRedis()
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})