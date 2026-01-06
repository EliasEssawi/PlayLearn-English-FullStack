import axios from "axios";

export async function isLoggedIn(): Promise<boolean> {
  try {
    await axios.get("/api/auth/authMe", { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

export async function logout():Promise<boolean> {
  try{
    await axios.post(`api/auth/logout`,{},{ withCredentials: true }); // ✅ needed to send cookie);
    localStorage.clear();
    return true;
  }catch {
    return false;
  }
}