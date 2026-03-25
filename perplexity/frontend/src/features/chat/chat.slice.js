import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    isStreaming: false,
    error: null,
    sidebarOpen: false,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;
      state.chats[chatId] = {
        id: chatId,
        title: title || "New Chat",
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, fileUrl, fileType, fileName, id } = action.payload;
      const msg = {
        id: id || `msg-${Date.now()}-${Math.random()}`,
        content: content || "",
        role,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileName: fileName || null,
      };
      if (!state.chats[chatId]) {
        state.chats[chatId] = { id: chatId, messages: [], title: "New Chat" };
      }
      state.chats[chatId].messages.push(msg);
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
      if (action.payload) {
        localStorage.setItem("currentChatId", action.payload);
      }
    },
 updateChatTitle: (state, action) => {
  const { chatId, title } = action.payload;

  if (!state.chats[chatId]) {
    state.chats[chatId] = {
      id: chatId,
      title: "New Chat",
      messages: [],
    };
  }

  if (title && title.trim()) {
    state.chats[chatId].title = title;
  }
},
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (state.chats[chatId]) state.chats[chatId].messages = messages;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addAIPlaceholder: (state, action) => {
      const { chatId } = action.payload;
      if (!state.chats[chatId]) return;
      state.chats[chatId].messages = state.chats[chatId].messages.filter(
        (m) => m.id !== "temp-ai-msg"
      );
      state.chats[chatId].messages.push({
        id: "temp-ai-msg",
        content: "",
        role: "ai",
      });
    },
    appendMessageChunk: (state, action) => {
      const { chatId, chunk } = action.payload;
      if (!state.chats[chatId]) return;
      const messages = state.chats[chatId].messages;
      const last = messages[messages.length - 1];
      if (last?.id === "temp-ai-msg") {
        last.content += chunk;
      }
    },
    replacePlaceholderWithReal: (state, action) => {
      const { chatId, realMessage } = action.payload;
      if (!state.chats[chatId]) return;
      const messages = state.chats[chatId].messages;
      const idx = messages.findIndex((m) => m.id === "temp-ai-msg");
      if (idx !== -1) {
        messages[idx] = {
          id: realMessage._id,
          content: realMessage.content,
          role: "ai",
        };
      }
    },
    removeAIPlaceholder: (state, action) => {
      const { chatId } = action.payload;
      if (!state.chats[chatId]) return;
      state.chats[chatId].messages = state.chats[chatId].messages.filter(
        (m) => m.id !== "temp-ai-msg"
      );
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStreaming: (state, action) => {
      state.isStreaming = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    deleteChat: (state, action) => {
      const chatId = action.payload;
      delete state.chats[chatId];
      if (state.currentChatId === chatId) {
        state.currentChatId = null;
        localStorage.removeItem("currentChatId");
      }
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  setStreaming,
  createNewChat,
  addNewMessage,
  addMessages,
  updateChatTitle,
  addAIPlaceholder,
  appendMessageChunk,
  replacePlaceholderWithReal,
  removeAIPlaceholder,
  setSidebarOpen,
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;