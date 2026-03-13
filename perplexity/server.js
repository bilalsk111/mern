import 'dotenv/config'
import app  from './src/app.js'
import connectToDB from './src/config/database.js'
import { testAi } from './src/services/ai.service.js'
const PORT = process.env.PORT || 3000

connectToDB()
.catch((err)=>{
    console.log('mongoDB connection failed:',err);
    process.exit(1)
})


testAi()
app.listen(PORT,()=>{
    console.log(`server running on PORT ${PORT}`);
    
})