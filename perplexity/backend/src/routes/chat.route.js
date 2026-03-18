import { Router } from "express"
import { getChats, getMessages, sendmessage,delChat, deleteMessage,createChat } from "../controllers/chat.controller.js"
import { authUser } from "../middleware/auth.middleware.js"
const chatrouter = Router()


chatrouter.post("/message",authUser,sendmessage)
chatrouter.post("/new", authUser, createChat);
chatrouter.get('/chat',authUser,getChats)
chatrouter.get('/:chatId/messages',authUser,getMessages)
chatrouter.delete('/delete:chatId',authUser,delChat)
chatrouter.delete("/message/:messageId",authUser, deleteMessage);



export default chatrouter