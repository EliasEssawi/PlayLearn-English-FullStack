import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import VideoCallModal from "./VideoCallModal";

function norm(x: any) {
  return String(x ?? "").trim().toLowerCase();
}
function buildUserId(input: string) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  if (raw.includes("::")) {
    const [email, profile] = raw.split("::");
    if (!email || !profile) return "";
    return `${norm(email)}::${norm(profile)}`;
  }
  return "";
}

function readMyUserIdFromLS() {
  // ✅ IMPORTANT: use the SAME key you actually save!
  const parentEmail = norm(
    localStorage.getItem("loggedInUser") || // <-- you use this in MainPage
      localStorage.getItem("parentEmail") ||
      localStorage.getItem("email") ||
      ""
  );

  let profileName = "";
  try {
    const raw = localStorage.getItem("activeProfile");
    if (raw) {
      const p = JSON.parse(raw);
      profileName = norm(p?.profileName || p?.email?.profileName || "");
    }
  } catch {}

  if (parentEmail && profileName) return `${parentEmail}::${profileName}`;

  return profileName ? `unknown@local::${profileName}` : "unknown@local::player";
}

type CallCtx = {
  socket: Socket;

  callModalOpen: boolean;
  openCallModal: () => void;
  closeCallModal: () => void;

  incomingFrom: string | null;
  showIncomingBar: boolean;

  onOpenFromBar: () => void;
  onDeclineFromBar: () => void;

  myUserId: string;
};

const CallContext = createContext<CallCtx | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside <CallProvider>");
  return ctx;
}

type Props = {
  socket: Socket;
  children: React.ReactNode;
};

export default function CallProvider({ socket, children }: Props) {
  const [callModalOpen, setCallModalOpen] = useState(false);

  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [showIncomingBar, setShowIncomingBar] = useState(false);
  const [autoAcceptFrom, setAutoAcceptFrom] = useState<string | null>(null);

  const [myUserId, setMyUserId] = useState<string>(() => readMyUserIdFromLS());

  // update id when profile changes (same tab updates should call setMyUserId manually too)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeProfile" || e.key === "loggedInUser" || e.key === "parentEmail" || e.key === "email") {
        setMyUserId(readMyUserIdFromLS());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ Register online whenever socket connects OR myUserId changes
  useEffect(() => {
    const me = buildUserId(myUserId) || norm(myUserId);
    if (!me.includes("::")) return;

    const register = () => socket.emit("user:online", { userId: me });

    socket.on("connect", register);
    if (socket.connected) register();

    return () => {
      socket.off("connect", register);
    };
  }, [socket, myUserId]);

  // ✅ GLOBAL incoming call listener (this is what shows the bar)
  useEffect(() => {
    const onIncoming = ({ fromUserId }: { fromUserId: string }) => {
      const from = buildUserId(fromUserId) || norm(fromUserId);
      if (!from) return;

      setIncomingFrom(from);
      setShowIncomingBar(true);
    };

    socket.on("call:incoming", onIncoming);
    return () => {
      socket.off("call:incoming", onIncoming);
    };
  }, [socket]);

  function openCallModal() {
    setCallModalOpen(true);
  }

  function closeCallModal() {
    setCallModalOpen(false);
    setAutoAcceptFrom(null);
  }

  function onOpenFromBar() {
    if (!incomingFrom) return;
    setAutoAcceptFrom(incomingFrom);
    setCallModalOpen(true);
    setShowIncomingBar(false);
  }

  function onDeclineFromBar() {
    if (!incomingFrom) return;
    socket.emit("call:decline", { toUserId: incomingFrom });
    setIncomingFrom(null);
    setShowIncomingBar(false);
    setAutoAcceptFrom(null);
  }

  const ctxValue = useMemo<CallCtx>(
    () => ({
      socket,
      callModalOpen,
      openCallModal,
      closeCallModal,
      incomingFrom,
      showIncomingBar,
      onOpenFromBar,
      onDeclineFromBar,
      myUserId,
    }),
    [socket, callModalOpen, incomingFrom, showIncomingBar, myUserId]
  );

  return (
    <CallContext.Provider value={ctxValue}>
      {children}

      {/* Notification bar */}
      {showIncomingBar && incomingFrom && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-[720px]">
          <div className="rounded-xl border border-white/10 bg-neutral-900 text-white shadow-lg px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              📲 Incoming call from <b className="select-all">{incomingFrom}</b>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onDeclineFromBar}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold"
              >
                Decline
              </button>
              <button
                onClick={onOpenFromBar}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global modal */}
      <VideoCallModal
        socket={socket}
        myUserId={myUserId}
        open={callModalOpen}
        onClose={closeCallModal}
        autoAcceptFrom={autoAcceptFrom}
        onAutoAccepted={() => {
          setIncomingFrom(null);
          setAutoAcceptFrom(null);
          setShowIncomingBar(false);
        }}
      />
    </CallContext.Provider>
  );
}
