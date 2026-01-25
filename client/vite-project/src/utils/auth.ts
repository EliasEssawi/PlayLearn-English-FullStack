import api from "../api/axios"; // or "../../api/axios" depending on your setup
// Check whether the user is currently authenticated

export async function isLoggedIn(): Promise<boolean> {
  try {
    await api.get("/api/auth/authMe"); // baseURL comes from axios.ts
    return true;
  } catch {
    return false;
  }
}
// Log the user out and clear local client state

export async function logout(): Promise<boolean> {
  try {
    await api.post("/api/auth/logout", {}); // cookie sent automatically
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}
