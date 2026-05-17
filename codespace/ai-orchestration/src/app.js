import express from 'express'
import  morgan from 'morgan'

const app = express()
app.use(express.json());
app.use(morgan('dev'))

app.get('api/\ai/healthz',(req,res)=>{
    res.status(200).json({
        message:'ai orchestration api running smoothly',
        status:'ok'
    })
})
export default app;