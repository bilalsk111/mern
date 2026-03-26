import { geminiairesponse, chatTitle } from "../services/ai.service.js";
import { uploadFile } from "../services/upload.service.js";
import { getIO } from "../sockets/server.socket.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import mongoose from "mongoose";
import userMemoryModel from "../models/user.memory.model.js";
import { summarizeChat } from "../services/ai.utils.js";

// Handle user message (text/file) + AI response
export async function sendmessage(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ message: "Message or file required" });
    }

    let chat;

    // 1. Find Chat
    if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id,
      });
    }

    const isNewChat = !chat;
    if (!chat) {
      chat = await chatModel.create({
        user: req.user.id,
        title: "New Chat",
      });
    }
    let fileData = {};
    if (req.file) {
      const uploaded = await uploadFile({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      fileData = {
        fileUrl: uploaded.url,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
      };
    }

    // 4. Save User Message
    const userMessageContent = message || (fileData.fileUrl ? "Please analyze this file." : "");
    const userMessage = await messageModel.create({
      chat: chat._id,
      content: userMessageContent,
      role: "user",
      ...fileData, // Ensure fileUrl and fileType are saved to DB
    });

    // 5. Memory Management
    if (message) {
      await saveMemory(req.user.id, message);
    }

    const memory = await userMemoryModel.findOne({
      userId: req.user.id,
    });
    const memoryText = memory?.facts?.join("\n") || "";

    // 6. Fetch Previous Messages
    const messages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .lean();

    const finalMessages = [
      {
        role: "system",
        content: `You are a helpful AI assistant. User memory: ${memoryText}`,
      },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
        fileUrl: m.fileUrl,
        fileType: m.fileType,
        fileName: m.fileName
      })),
    ];

    const io = getIO();
    let fullResponse = "";

    // 8. Stream Response and wait for it to finish
    // We pass the onChunk callback to send real-time socket events
    fullResponse = await geminiairesponse(
      finalMessages, 
      (chunk) => {
        io.to(chat._id.toString()).emit(`stream-${chat._id}`, chunk);
      },
      { userName: req.user?.username || "User" } 
    );

    // 9. Save AI Message
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: fullResponse,
      role: "ai",
    });

    // 10. Title Generation
    if (chat.title === "New Chat") {
      const newTitle = await chatTitle(
        (message || "File Analysis") + " " + fullResponse.slice(0, 50)
      );
      chat.title = newTitle || message?.slice(0, 30) || "New Chat";
      await chat.save();
    }

    // 11. Summarize old chats
    if (messages.length > 0 && messages.length % 10 === 0) {
      const summary = await summarizeChat(messages);
      await chatModel.findByIdAndUpdate(chat._id, { summary });
    }

    // 12. Final Socket Emit
    io.to(chat._id.toString()).emit(`stream-done-${chat._id}`, {
      aiMessageId: aiMessage._id,
    });

    // 13. Send HTTP Response
    res.json({
      chatId: chat._id,
      isNewChat,
      chat: { _id: chat._id, title: chat.title },
      userMessage,
      aiMessage,
    });

  } catch (err) {
    console.error("sendmessage error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

export async function getChats(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ chats });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
}

// Get messages of a specific chat
export async function getMessages(req, res) {
  try {
    const { chatId } = req.params;

    // Validate ownership
    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

// Delete entire chat with all messages
export async function delChat(req, res) {
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }
    const chat = await chatModel.findOneAndDelete({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    await messageModel.deleteMany({ chat: chatId });

    res.status(200).json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
}

// Delete single message from chat
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;

    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Ensure user owns the chat
    const chat = await chatModel.findOne({
      _id: message.chat,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await messageModel.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message" });
  }
}

// Create new empty chat
export const createChat = async (req, res) => {
  try {
    const chat = await chatModel.create({
      user: req.user.id,
      title: "New Chat",
    });

    res.status(201).json({ chat });
  } catch (err) {
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Update chat title
export async function updateChatTitleHandler(req, res) {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await chatModel.findOneAndUpdate(
      { _id: chatId, user: req.user.id },
      { title },
      { new: true },
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ chat });
  } catch (err) {
    res.status(500).json({ message: "Failed to update title" });
  }
}

export async function saveMemory(userId, message) {
  if (!message) return;

  let facts = [];
  const msg = message.toLowerCase();

  if (msg.includes("developer")) {
    facts.push("user is a developer");
  }

  if (msg.includes("depth")) {
    facts.push("user prefers detailed answers");
  }

  if (!facts.length) return;

  await userMemoryModel.updateOne(
    { userId },
    { $addToSet: { facts: { $each: facts } } },
    { upsert: true },
  );
}
