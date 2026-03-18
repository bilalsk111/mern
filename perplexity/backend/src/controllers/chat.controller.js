import { geminiairesponse, chatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"

export async function sendmessage(req, res) {
    const { message, chat: chatId } = req.body;

    let title = null, chat = null;

    if (!chatId) {
        title = await chatTitle(message);
        chat = await chatModel.create({
            user: req.user.id,
            title
        });
    }

    const currentChatId = chatId || chat._id;

    const userMessage = await messageModel.create({
        chat: currentChatId,
        content: message,
        role: "user"
    });

    const messages = await messageModel.find({ chat: currentChatId });

    const result = await geminiairesponse(messages);

    const aimessage = await messageModel.create({
        chat: currentChatId,
        content: result,
        role: "ai"
    });

 // controller snippet
res.json({
    chatId: currentChatId, // Hamesha ID bhejein
    chat: chat || { _id: currentChatId },
    title,
    userMessage,
    aimessage,
});
}


export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })
    res.status(200).json({
        message: "chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;
    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })
    if (!chat) {
        return res.status(404).json({
            message: "chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })
    res.status(200).json({
        message: "message retrieved succussfully",
        messages
    })
}
export async function delChat(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "chat not found"
        })
    }
    res.status(200).json({
        message: "cjat deleted succussfully"
    })
}

export async function deleteMessage(req, res) {
    const { messageId } = req.params;
    
        const message = await messageModel.findById(messageId);

        if (!message) {
            return res.status(404).json({
                message: "message not found"
            });
        }

        const chat = await chatModel.findOne({
            _id: message.chat,
            user: req.user.id
        });

        if (!chat) {
            return res.status(403).json({
                message: "unauthorized"
            });
        }

        await messageModel.findByIdAndDelete(messageId);

        res.status(200).json({
            message: "message deleted successfully"
        });

}

export const createChat = async (req, res) => {
    try {
        const chat = await chatModel.create({
            user: req.user.id,
            title: "New Chat"
        });

        res.status(201).json({ chat });
    } catch (err) {
        res.status(500).json({ message: "Failed to create chat" });
    }
};