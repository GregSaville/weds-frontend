// src/utils/auth.js
const AUTH_KEY = "weds_auth";

export function setAuth(username, password) {
  const token = btoa(`${username}:${password}`);
  localStorage.setItem(AUTH_KEY, token);
}

export function getAuthHeader() {
  const token = localStorage.getItem(AUTH_KEY);
  return token ? `Basic ${token}` : null;
}

export async function checkAuth() {
  const header = getAuthHeader();
  if (!header) return false;

  try {
    const response = await fetch("http://localhost:8080/admin/health", {
      headers: { Authorization: header },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
