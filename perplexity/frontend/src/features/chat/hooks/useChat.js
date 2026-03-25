import { sendMessage, getChats, getMessages, createChat, delChat } from "../services/chat.api";
import {
  setChats, setLoading, setError, setCurrentChatId,
  createNewChat, addNewMessage, addMessages, updateChatTitle,
  addAIPlaceholder, replacePlaceholderWithReal, appendMessageChunk,
  removeAIPlaceholder, deleteChat, setStreaming,
} from "../chat.slice";
import { useDispatch } from "react-redux";

export function useChat() {
  const dispatch = useDispatch();

  const handleSendMessage = async ({ message, chatId, file }) => {
    if (!message?.trim() && !file) return;

    const tempFileUrl = file ? URL.createObjectURL(file) : null;
    const tempChatId = chatId || `temp-${Date.now()}`;

    // Optimistically add user message
    dispatch(addNewMessage({
      chatId: tempChatId,
      content: message || "",
      role: "user",
      fileUrl: tempFileUrl,
      fileType: file?.type || null,
      fileName: file?.name || null,
    }));

    dispatch(addAIPlaceholder({ chatId: tempChatId }));
    dispatch(setLoading(true));
    dispatch(setStreaming(true));

    try {
 if (!chatId && message) {
  dispatch(updateChatTitle({
    chatId: tempChatId,
    title: "Thinking...",
  }));
}
      const response = await sendMessage({ message, chatId, file });
      const realChatId = response.chatId;

      // If new chat, migrate messages
      if (!chatId && tempChatId !== realChatId) {
        dispatch(createNewChat({ chatId: realChatId, title: response.chat?.title || "New Chat" }));
        dispatch(setCurrentChatId(realChatId));

        // Move messages to real chat ID
        const data = await getMessages(realChatId);
        const formatted = (data.messages || []).map((msg) => ({
          id: msg._id,
          content: msg.content,
          role: msg.role,
          fileUrl: msg.fileUrl || null,
          fileType: msg.fileType || null,
          fileName: msg.fileName || null,
        }));
        dispatch(addMessages({ chatId: realChatId, messages: formatted }));
      }

      if (response.chat?.title) {
        dispatch(updateChatTitle({ chatId: realChatId, title: response.chat.title }));
      }

      const finalChatId = chatId || realChatId;

dispatch(replacePlaceholderWithReal({
  chatId: finalChatId,
  realMessage: response.aiMessage,
}));
    } catch (err) {
      console.error("Send message error:", err);
      dispatch(removeAIPlaceholder({ chatId: tempChatId }));
      dispatch(addNewMessage({
        chatId: tempChatId,
        content: "⚠️ Failed to get response. Please try again.",
        role: "ai",
      }));
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
      dispatch(setStreaming(false));
    }
  };

  const handleGetChats = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getChats();
      const formatted = (data.chats || []).reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title || "New Chat",
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(formatted));

      const savedId = localStorage.getItem("currentChatId");
      if (savedId && formatted[savedId]) {
        await handleOpenChat(savedId);
      } else if (data.chats?.length > 0) {
        await handleOpenChat(data.chats[0]._id);
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOpenChat = async (chatId) => {
    if (!chatId) return;
    dispatch(setCurrentChatId(chatId));
    try {
      const data = await getMessages(chatId);
      const formatted = (data.messages || []).map((msg) => ({
        id: msg._id,
        content: msg.content,
        role: msg.role,
        fileUrl: msg.fileUrl || null,
        fileType: msg.fileType || null,
        fileName: msg.fileName || null,
      }));
      dispatch(addMessages({ chatId, messages: formatted }));
    } catch {
      dispatch(addMessages({ chatId, messages: [] }));
    }
  };

  const handleNewChat = async () => {
    dispatch(setLoading(true));
    try {
      const { chat } = await createChat();
      dispatch(createNewChat({ chatId: chat._id, title: chat.title }));
      dispatch(setCurrentChatId(chat._id));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await delChat(chatId);
      dispatch(deleteChat(chatId));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return {
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleNewChat,
    handleDeleteChat,
  };
}