import axios from "axios";

export async function isLoggedIn(): Promise<boolean> {
  try {
    await axios.get("/api/auth/authMe", { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}
