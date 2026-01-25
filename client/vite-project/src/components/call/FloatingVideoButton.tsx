import { useState } from "react";
import type { Socket } from "socket.io-client";
import VideoCallModal from "./VideoCallModal";

type Props = {
  socket: Socket;
  myUserId: string;
  darkMode: boolean;
};

export default function FloatingVideoButton({ socket, myUserId, darkMode }: Props) {
  const [open, setOpen] = useState(false);

  const bubbleBg = darkMode ? "#1e293b" : "#86e07f";
  const bubbleShadow = darkMode
    ? "0 10px 30px rgba(0,0,0,0.35)"
    : "0 10px 30px rgba(15,23,42,0.18)";

  return (
    <>
      {/* Floating video icon */}
      <button
        type="button"
        title="Video Call"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 22,
          bottom: 22,
          width: 60,
          height: 60,
          borderRadius: 999,
          border: "none",
          background: bubbleBg,
          color: darkMode ? "#f8fafc" : "#0f172a",
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: bubbleShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
        }}
      >
        🎥
      </button>

      <VideoCallModal
        socket={socket}
        myUserId={myUserId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
