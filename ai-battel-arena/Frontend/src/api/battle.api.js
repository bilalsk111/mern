/**
 * @file battle.api.js
 * Centralized API calls. Every request attaches the JWT from localStorage.
 */

const BASE_URL = "https://arenapro.onrender.com";

/** Returns the Authorization header object, throws if no token found */
function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function startBattle(problem, chatId) {
  const res = await fetch(`${BASE_URL}/battle`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ problem, chatId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to start battle");
  }
  return res.json();
}

export async function getChats() {
  const res = await fetch(`${BASE_URL}/chats`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function getChatById(id) {
  const res = await fetch(`${BASE_URL}/chats/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Chat not found");
  return res.json();
}

export async function deleteChat(id) {
  const res = await fetch(`${BASE_URL}/chats/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete chat");
}