import { useState } from "react";
import type { Socket } from "socket.io-client";
import VideoCallModal from "./VideoCallModal";

type Props = {
  socket: Socket;
  myUserId: string;
  darkMode: boolean;
};

export default function FloatingVideoButton({ socket, myUserId, darkMode }: Props) {
  // Controls whether the video call modal is visible
  const [open, setOpen] = useState(false);

  // Dynamic styling based on dark mode (keeps the button readable in both themes)
  const bubbleBg = darkMode ? "#1e293b" : "#86e07f";
  const bubbleShadow = darkMode
    ? "0 10px 30px rgba(0,0,0,0.35)"
    : "0 10px 30px rgba(15,23,42,0.18)";

  return (
    <>
      {/* Floating action button (FAB) that opens the video call modal */}
      <button
        type="button"
        title="Video Call"
        onClick={() => setOpen(true)}// open modal on click
        style={{
          position: "fixed",// stays visible while scrolling
          right: 22,
          bottom: 22,
          width: 60,
          height: 60,
          borderRadius: 999,// circular button
          border: "none",
          background: bubbleBg,
          color: darkMode ? "#f8fafc" : "#0f172a",
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: bubbleShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,// keeps it above most UI elements/modals
        }}
      >
        🎥
      </button>

      {/* Video call modal (mounted always, shown/hidden by `open`) */}
      <VideoCallModal
        socket={socket}// socket connection used for signaling / realtime events
        myUserId={myUserId}// identifies the current user in the call flow
        open={open}// controls modal visibility
        onClose={() => setOpen(false)}// close handler passed down to modal
      />
    </>
  );
}
