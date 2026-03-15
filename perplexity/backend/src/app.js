import express from "express"
import cookieParser from "cookie-parser";
import morgan from "morgan"
import cors from "cors"
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"))
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))


import authRouter from "./routes/auth.route.js"

app.get('/',(req,res)=>{
    res.json({message:"server is running"})
})

app.use('/api/auth',authRouter)

export default app;