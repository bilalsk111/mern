/**
 * @file google.auth.api.js
 * Google OAuth helpers.
 * Login redirects to backend. Logout is purely client-side (JWT is stateless).
 */

const BASE_URL = "https://arenapro.onrender.com";

/** Redirects browser to Google OAuth flow */
export function loginWithGoogle() {
  window.location.href = `${BASE_URL}/auth/google`;
}

/**
 * Clears local auth state and redirects to /login.
 * No server call needed — JWT is stateless, just remove it locally.
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("chatId");
  window.location.href = "/login";
}