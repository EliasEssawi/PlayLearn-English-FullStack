import axios from "axios";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
       
export async function isLoggedIn(): Promise<boolean> {
  try {
    await axios.get(`${API_BASE}/auth/authMe`, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

export async function logout():Promise<boolean> {
  try{
    await axios.post(`${API_BASE}/auth/logout`,{},{ withCredentials: true }); // ✅ needed to send cookie);
    localStorage.clear();
    return true;
  }catch {
    return false;
  }
}