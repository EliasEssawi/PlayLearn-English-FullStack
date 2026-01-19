import api from "../api/axios"; // or "../../api/axios" depending on your setup

export async function isLoggedIn(): Promise<boolean> {
  try {
    await api.get("/api/auth/authMe"); // baseURL comes from axios.ts
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<boolean> {
  try {
    await api.post("/api/auth/logout", {}); // cookie sent automatically
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}
