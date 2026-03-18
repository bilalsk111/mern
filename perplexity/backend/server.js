import 'dotenv/config'
import app  from './src/app.js'
import http from "http"
import connectToDB from './src/config/database.js'
import { geminiairesponse } from './src/services/ai.service.js'
import { initSocket } from './src/sockets/server.socket.js'
const PORT = process.env.PORT || 3000


const httpServer = http.createServer(app)
initSocket(httpServer)

connectToDB()
.catch((err)=>{
    console.log('mongoDB connection failed:',err);
    process.exit(1)
})


geminiairesponse() 
httpServer.listen(PORT,()=>{
    console.log(`server running on PORT ${PORT}`);
    
})