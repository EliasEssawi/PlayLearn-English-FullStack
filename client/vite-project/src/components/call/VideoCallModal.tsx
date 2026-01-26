import React, { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

type Props = {
  socket: Socket;
  myUserId: string;
  open: boolean;
  onClose: () => void; // X closes modal only
  autoAcceptFrom?: string | null;
  onAutoAccepted?: () => void;
};

type Status = "idle" | "ringing" | "calling" | "connecting" | "in_call";

// WebRTC config: uses Google's public STUN server for ICE candidate discovery
const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function norm(x: any) {
  return String(x ?? "").trim().toLowerCase();
}

/** Accept either "email::profile" and normalize to "email::profile" */
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

export default function VideoCallModal({
  socket,
  myUserId,
  open,
  onClose,
  autoAcceptFrom = null,
  onAutoAccepted,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [callWith, setCallWith] = useState<string | null>(null);
  const callWithRef = useRef<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<string>("");

  const [emailInput, setEmailInput] = useState("");
  const [profileInput, setProfileInput] = useState("");
  const [toIdPaste, setToIdPaste] = useState("");

  const isConnecting = status === "connecting";
  const isInCall = status === "in_call";

  // ---------------------------
  // Helpers
  // ---------------------------
  async function startLocalStream() {
    if (localStreamRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err: any) {
      const name = String(err?.name || "");
      if (name === "NotReadableError") {
        setNotice(
          "⚠️ Camera is busy. Close other apps/tabs using camera (Zoom/Meet/etc) and try again."
        );
      } else if (name === "NotAllowedError") {
        setNotice("⚠️ Camera permission denied. Allow camera/mic and try again.");
      } else {
        setNotice(`⚠️ Could not open camera/mic: ${String(err?.message || err)}`);
      }
      throw err;
    }
  }

  function createPeer(toUserId: string) {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    pc.ontrack = (e) => {
      const remoteStream = e.streams?.[0];
      if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("call:ice", { toUserId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setStatus("in_call");
        setNotice("🟢 Connected");
        return;
      }

      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        hangUp(false, "📴 Call ended");
        return;
      }

      // ✅ don't auto-end on "disconnected" immediately
    };

    return pc;
  }

  function setOther(userId: string | null) {
    setCallWith(userId);
    callWithRef.current = userId;
  }

  function cleanup() {
    try {
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIncomingFrom(null);
    setOther(null);
    setStatus("idle");
  }

  /** hang up and optionally notify other side */
  function hangUp(notify: boolean, msg = "📴 Call ended") {
    const other = callWithRef.current;
    if (notify && other) socket.emit("call:end", { toUserId: other });

    setNotice(msg);
    cleanup();
  }

  // ---------------------------
  // 🔥 IMPORTANT FIX:
  // Clear stale "Call ended" when modal opens (because component returns null, it stays mounted)
  // ---------------------------
  useEffect(() => {
    if (!open) return;

    // Reset ONLY UI state that causes the "Call ended" bug.
    setNotice("");
    setStatus("idle");
    setIncomingFrom(null);
    setOther(null);

    // optional: clear input fields on open
    // setEmailInput(""); setProfileInput(""); setToIdPaste("");
  }, [open]);

  // ---------------------------
  // Actions
  // ---------------------------
  async function startCallByEmailProfile() {
    const email = norm(emailInput);
    const profile = norm(profileInput);
    if (!email || !profile) {
      setNotice("⚠️ Please type Email + Profile Name.");
      return;
    }

    const toUserId = `${email}::${profile}`;
    setOther(toUserId);
    setNotice(`📞 Calling ${toUserId}...`);
    setStatus("calling");

    socket.emit("call:request", { toUserId });
  }

  async function startCallByPaste() {
    const toUserId = buildUserId(toIdPaste);
    if (!toUserId) {
      setNotice("⚠️ Paste must be in format: email::profileName");
      return;
    }

    setOther(toUserId);
    setNotice(`📞 Calling ${toUserId}...`);
    setStatus("calling");

    socket.emit("call:request", { toUserId });
  }

  function acceptIncoming() {
    if (!incomingFrom) return;
    const from = incomingFrom;

    setIncomingFrom(null);
    setOther(from);
    setNotice("✅ Accepting...");
    setStatus("connecting");

    socket.emit("call:accept", { toUserId: from });
  }

  function declineIncoming() {
    if (!incomingFrom) return;
    const from = incomingFrom;

    socket.emit("call:decline", { toUserId: from });
    setIncomingFrom(null);
    setNotice("❌ Declined");
    setStatus("idle");
  }

  function closeOnly() {
    // close modal UI; also cleanup any streams/pc
    cleanup();
    setNotice(""); // ✅ so it doesn't show "Call ended" next time
    onClose();
  }

  // ---------------------------
  // Auto-accept (ONLY ONCE) - TOP LEVEL HOOK ✅
  // ---------------------------
  useEffect(() => {
    if (!open) return;
    if (!incomingFrom) return;
    if (!autoAcceptFrom) return;

    if (incomingFrom === autoAcceptFrom) {
      acceptIncoming();
      onAutoAccepted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, incomingFrom, autoAcceptFrom]);

  // ---------------------------
  // Socket events (NO NESTED HOOKS ✅)
  // ---------------------------
  useEffect(() => {
    if (!open) return;

    const me = buildUserId(myUserId) || norm(myUserId);

    if (!me.includes("::")) {
      setNotice("⚠️ Your Call ID is missing. Make sure parentEmail + profileName exist.");
    }

    socket.emit("user:online", { userId: me });

    const onIncoming = ({ fromUserId }: { fromUserId: string }) => {
      const from = buildUserId(fromUserId) || norm(fromUserId);
      setIncomingFrom(from);
      setNotice(`📲 Incoming call from ${from}`);
      setStatus("ringing");
    };

    const onAccept = async ({ fromUserId }: { fromUserId: string }) => {
      const from = buildUserId(fromUserId) || norm(fromUserId);

      setOther(from);
      setNotice("✅ Accepted. Connecting...");
      setStatus("connecting");

      await startLocalStream();
      const pc = createPeer(from);

      localStreamRef.current!.getTracks().forEach((t) => {
        pc.addTrack(t, localStreamRef.current!);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", { toUserId: from, offer });
    };

    const onDecline = () => {
      hangUp(false, "❌ Declined");
    };

    const onOffer = async ({ fromUserId, offer }: { fromUserId: string; offer: any }) => {
      const from = buildUserId(fromUserId) || norm(fromUserId);

      setOther(from);
      setNotice("📡 Offer received. Connecting...");
      setStatus("connecting");

      await startLocalStream();
      const pc = createPeer(from);

      localStreamRef.current!.getTracks().forEach((t) => {
        pc.addTrack(t, localStreamRef.current!);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { toUserId: from, answer });
    };

    const onAnswer = async ({ answer }: { answer: any }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIce = async ({ candidate }: { candidate: any }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    const onEnd = () => {
      // ✅ don't set notice then call hangUp that overwrites; just hangUp with message
      hangUp(false, "📴 Other side ended call");
    };

    const onError = ({ message }: { message: string }) => {
      setNotice(`⚠️ ${message}`);
      setStatus("idle");
      setOther(null);
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:accept", onAccept);
    socket.on("call:decline", onDecline);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice", onIce);
    socket.on("call:end", onEnd);
    socket.on("call:error", onError);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accept", onAccept);
      socket.off("call:decline", onDecline);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice", onIce);
      socket.off("call:end", onEnd);
      socket.off("call:error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, socket, myUserId]);

  // ---------------------------
  // UI
  // ---------------------------
  if (!open) return null;

  const myIdNormalized = buildUserId(myUserId) || myUserId;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
      <div className="bg-neutral-900 text-white rounded-xl w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto p-4 relative">
        <button
          onClick={closeOnly}
          className="absolute right-3 top-3 text-lg z-10 bg-black/40 hover:bg-black/60 rounded px-2"
        >
          ✕
        </button>

        <h2 className="text-xl mb-2 pr-10">
          Video Call <span className="opacity-70 text-sm">({status})</span>
        </h2>

        {notice ? (
          <div className="mb-2 p-2 rounded bg-white/5 border border-white/10 text-sm">
            {notice}
          </div>
        ) : null}

        <div className="relative mt-2">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded bg-black w-full h-[320px] sm:h-[360px] md:h-[420px] object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute right-3 bottom-3 rounded bg-black w-[140px] h-[96px] sm:w-[160px] sm:h-[110px] md:w-[180px] md:h-[120px] object-cover border border-white/20"
          />
        </div>

        {(status === "idle" || status === "calling") ? (
          <div className="mt-3 p-3 rounded bg-white/5 border border-white/10 space-y-3">
            <div className="text-xs opacity-80">
              Your Call ID:
              <span className="ml-2 font-semibold select-all">{myIdNormalized}</span>
            </div>

            <div>
              <div className="text-xs opacity-70 mb-2">
                Call a friend by entering their <b>Parent Email</b> + <b>Profile Name</b>.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Friend parent email"
                  className="px-3 py-2 rounded bg-black/40 border border-white/10 outline-none"
                />
                <input
                  value={profileInput}
                  onChange={(e) => setProfileInput(e.target.value)}
                  placeholder="Friend profile name"
                  className="px-3 py-2 rounded bg-black/40 border border-white/10 outline-none"
                />
              </div>

              <button
                onClick={startCallByEmailProfile}
                disabled={!emailInput.trim() || !profileInput.trim() || isConnecting || isInCall}
                className="mt-2 w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
              >
                Call
              </button>

              <div className="text-xs opacity-60 mt-2">
                Will call as:{" "}
                <b>
                  {emailInput.trim() && profileInput.trim()
                    ? `${norm(emailInput)}::${norm(profileInput)}`
                    : "email::profile"}
                </b>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs opacity-70 mb-2">
                Or paste full ID (format <b>email::profileName</b>):
              </div>

              <div className="flex gap-2 items-center">
                <input
                  value={toIdPaste}
                  onChange={(e) => setToIdPaste(e.target.value)}
                  placeholder="Paste friend ID (email::profileName)"
                  className="flex-1 px-3 py-2 rounded bg-black/40 border border-white/10 outline-none"
                />

                <button
                  onClick={startCallByPaste}
                  disabled={!toIdPaste.trim() || isConnecting || isInCall}
                  className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40"
                >
                  Call
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {status === "ringing" && incomingFrom && (
          <div className="mt-3 flex gap-3 items-center">
            <span>
              Incoming call from <b>{incomingFrom}</b>
            </span>

            <button
              onClick={acceptIncoming}
              className="px-3 py-2 rounded bg-green-600 hover:bg-green-700"
            >
              Accept
            </button>

            <button
              onClick={declineIncoming}
              className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-3 items-center">
          <button
            onClick={() => hangUp(true)}
            className="px-3 py-2 rounded bg-red-700 hover:bg-red-800"
            disabled={status === "idle"}
          >
            Hang Up
          </button>

          {callWith && (
            <span className="text-sm opacity-70">
              With: <b>{callWith}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
