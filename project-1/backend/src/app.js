let express = require('express')
let cookieParser = require('cookie-parser')
let cors = require('cors')
const { errorHandler } = require('./middlewares/error.middleware')

let app = express()

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))

app.use(express.json())
app.use(cookieParser())

let authRouter = require('./routes/auth.routes')
let postRouter = require('./routes/post.routes')
let userRouter = require('./routes/user.routes')

app.use(errorHandler);
app.use('/api/auth',authRouter)
app.use('/api/posts',postRouter)
app.use('/api/users',userRouter)

module.exports = app
