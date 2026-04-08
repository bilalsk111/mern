import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import passport from "passport";

import runGraph from "./ai/graph.ai.js";
import Chat from "./models/chat.model.js";
import { authMiddleware } from "./auth/auth.middleware.js";
import morgan from "morgan";
import "./auth/google.auth.js";

const app = express();

app.use(cors({ origin: "https://arenapro.onrender.com", credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(cors({
  origin: true, 
  credentials: true, 
}))
app.use(express.static("./public"))
// ─── Auth ─────────────────────────────────────────────────────────────────────

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,  
        email: user.email,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.redirect(`https://arenapro.onrender.com?token=${token}`);
  }
);

// NOTE: No /auth/logout route needed — JWT is stateless.
// The frontend just removes the token from localStorage.

// ─── Battle ───────────────────────────────────────────────────────────────────

app.post("/battle", authMiddleware, async (req: any, res) => {
  const { problem, chatId } = req.body;
  if (!problem) return res.status(400).json({ error: "Problem is required" });

  try {
    const userId = req.user._id;

    let chat = chatId ? await Chat.findOne({ _id: chatId, userId }) : null;
    if (!chat) chat = await Chat.create({ userId, messages: [] });

    const history: string[] = chat.messages.map((m: any) => m.problem);
    const result = await runGraph(problem, history);

    if (!result?.judge) throw new Error("Invalid AI response: missing judge data");

    chat.messages.push({ problem, result });
    await chat.save();

    res.json({ chatId: chat._id, result });
  } catch (err: any) {
    console.error("Battle error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// ─── Chats ────────────────────────────────────────────────────────────────────

app.get("/chats", authMiddleware, async (req: any, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("_id messages createdAt updatedAt");
    res.json(chats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/chats/:id", authMiddleware, async (req: any, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id })
      .select("_id messages createdAt updatedAt");
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/chats/:id", authMiddleware, async (req: any, res) => {
  try {
    const deleted = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Chat not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_req, res) => res.send("AI Battle Arena API is running."));

export default app;