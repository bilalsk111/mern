import { useState, useCallback, useEffect } from "react";
import { startBattle, getChatById, getChats, deleteChat } from "../api/battle.api";

export function useBattle() {
  const [chatList, setChatList] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [activeBattle, setActiveBattle] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [chatId, setChatId] = useState(() => localStorage.getItem("chatId") || null);

  const persistChatId = useCallback((id) => {
    setChatId(id);
    setActiveChatId(id);
    if (id) localStorage.setItem("chatId", id);
    else localStorage.removeItem("chatId");
  }, []);

  const normalizeBattles = useCallback((messages = []) =>
    messages.map((m, i) => ({
      id: i + 1,
      question: m.problem,
      solution_1: m.result.solution_1,
      solution_2: m.result.solution_2,
      judge: m.result.judge,
    })), []);

  const loadChats = useCallback(async () => {
    try {
      const data = await getChats();
      if (!Array.isArray(data)) return;
      setChatList((prev) =>
        JSON.stringify(prev) === JSON.stringify(data) ? prev : data
      );
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }, []);

  const loadChat = useCallback(async (id) => {
    try {
      setRestoring(true);
      const data = await getChatById(id);
      if (!data?.messages?.length) return;
      const battles = normalizeBattles(data.messages);
      setBattleHistory(battles);
      setActiveBattle(battles[battles.length - 1]);
      persistChatId(id);
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setRestoring(false);
    }
  }, [normalizeBattles, persistChatId]);

  // On mount: load sidebar + restore last open chat
  useEffect(() => {
    const init = async () => {
      await loadChats();
      const savedId = localStorage.getItem("chatId");
      if (!savedId) return;
      setRestoring(true);
      try {
        const chat = await getChatById(savedId);
        if (!chat?.messages?.length) return;
        const battles = normalizeBattles(chat.messages);
        setBattleHistory(battles);
        setActiveBattle(battles[battles.length - 1]);
        setActiveChatId(savedId);
        setChatId(savedId);
      } catch (err) {
        console.error("Failed to restore chat:", err);
        localStorage.removeItem("chatId");
        setChatId(null);
      } finally {
        setRestoring(false);
      }
    };
    init();
  }, []);

  const sendChallenge = useCallback(async (customInput) => {
    const text = (customInput || input).trim();
    if (!text) return;

    setPendingQuestion(text);
    setInput("");
    setLoading(true);
    setActiveBattle(null);

    try {
      const data = await startBattle(text, chatId);
      if (!data?.result?.judge) throw new Error("Invalid response: missing judge data.");

      const newBattle = {
        id: Date.now(),
        question: text,
        solution_1: data.result.solution_1,
        solution_2: data.result.solution_2,
        judge: data.result.judge,
      };

      setBattleHistory((prev) => [...prev, newBattle]);
      setActiveBattle(newBattle);
      persistChatId(data.chatId);
      await loadChats();
    } catch (err) {
      console.error("Battle error:", err);
      alert(err.message || "The arena is currently unavailable.");
    } finally {
      setLoading(false);
      setPendingQuestion("");
    }
  }, [input, chatId, persistChatId, loadChats]);

  const handleDeleteChat = useCallback(async (id) => {
    try {
      await deleteChat(id);
      setChatList((prev) => prev.filter((c) => c._id !== id));
      if (activeChatId === id) {
        setBattleHistory([]);
        setActiveBattle(null);
        persistChatId(null);
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  }, [activeChatId, persistChatId]);

  const newChat = useCallback(() => {
    setBattleHistory([]);
    setActiveBattle(null);
    setPendingQuestion("");
    persistChatId(null);
  }, [persistChatId]);

  return {
    chatList,
    chatId: activeChatId,
    battleHistory,
    activeBattle,
    pendingQuestion,
    input,
    setInput,
    loading,
    restoring,
    sendChallenge,
    newChat,
    loadChat,
    handleDeleteChat,
  };
}