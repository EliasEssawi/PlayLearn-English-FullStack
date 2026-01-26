import { useMemo, useEffect } from "react";
import io from "socket.io-client";
import { Routes, Route } from "react-router-dom";
import Login from "./components/authintication/login";
import Register from "./components/authintication/register";
import StarterPage from "./pages/starterPage";
import ChooseProfile from "./components/profile/chooseProfile";
import ForgotPassword from "./components/authintication/forgotPass";
import AddProfile from "./components/profile/addprofile";
import ParentPage from "./components/mainPage/parentPage";
import MainPage from "./components/mainPage/mainPage";
import Vocabulary from "./components/vocabulary/vocabularyHome";
import TranslateGame from "./components/vocabulary/translate";
import ProgressPage from "./components/mainPage/progressPage";

import CallProvider from "./components/call/CallProvider"; // ✅ adjust path if needed

function App() {
  // ✅ Socket server URL (env first, fallback local)
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

  // ✅ Create ONE socket instance for the whole app
 const socket = useMemo(() => {
  return io(SOCKET_URL, {
    transports: ["polling", "websocket"], // ✅ allow fallback
    withCredentials: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
  });
}, [SOCKET_URL]);


  // ✅ Clean up socket on full app unmount (rare, but correct)
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
  
      <CallProvider socket={socket}>
        <Routes>
          <Route path="/" element={<StarterPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chooseProfile" element={<ChooseProfile />} />
          <Route path="/addprofile" element={<AddProfile />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/parentPage" element={<ParentPage />} />
          <Route path="/vocabulary/index" element={<Vocabulary />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/vocabulary/translate" element={<TranslateGame />} />
          <Route path="/mainPage" element={<MainPage />} />
        </Routes>
      </CallProvider>

  );
}

export default App;
