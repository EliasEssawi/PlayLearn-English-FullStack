import React, { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

type Props = {
  socket: Socket;
  myUserId: string;
  open: boolean;
  onClose: () => void; // X closes modal only
  autoAcceptFrom?: string | null;
  onAutoAccepted?: () => void;
  incomingFromExternal?: string | null;
};

type Status = "idle" | "ringing" | "calling" | "connecting" | "in_call";

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
  incomingFromExternal = null,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ✅ ICE queue to prevent "stuck connecting"
  const pendingIceRef = useRef<any[]>([]);

  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [callWith, setCallWith] = useState<string | null>(null);
  const callWithRef = useRef<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<string>("");

  const [emailInput, setEmailInput] = useState("");
  const [profileInput, setProfileInput] = useState("");

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
      // don't auto-end on "disconnected" immediately
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

    pendingIceRef.current = [];

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

  function closeOnly() {
    cleanup();
    setNotice("");
    onClose();
  }

  // ---------------------------
  // ✅ ONE EFFECT ONLY:
  // Reset + seed incoming from provider when modal opens
  // ---------------------------
  useEffect(() => {
    if (!open) return;

    setNotice("");
    setStatus("idle");
    setOther(null);

    if (incomingFromExternal) {
      setIncomingFrom(incomingFromExternal);
      setNotice(`📲 Incoming call from ${incomingFromExternal}`);
      setStatus("ringing");
    } else {
      setIncomingFrom(null);
    }
  }, [open, incomingFromExternal]);

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

  function acceptIncoming(fromArg?: string) {
    const from = fromArg || incomingFrom;
    if (!from) return;

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

  // ---------------------------
  // ✅ Auto-accept from bar: works with provider incoming OR modal incoming
  // ---------------------------
  useEffect(() => {
    if (!open) return;
    if (!autoAcceptFrom) return;

    const from = incomingFrom || incomingFromExternal;
    if (!from) return;

    if (from === autoAcceptFrom) {
      // align state then accept
      setIncomingFrom(from);
      setStatus("ringing");
      acceptIncoming(from);
      onAutoAccepted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoAcceptFrom, incomingFrom, incomingFromExternal]);

  // ---------------------------
  // Socket events
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

      // ✅ flush queued ICE after remote description exists
      for (const c of pendingIceRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      }
      pendingIceRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { toUserId: from, answer });
    };

    const onAnswer = async ({ answer }: { answer: any }) => {
      const pc = pcRef.current;
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // ✅ flush queued ICE after remote description exists
      for (const c of pendingIceRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      }
      pendingIceRef.current = [];
    };

    const onIce = async ({ candidate }: { candidate: any }) => {
      if (!candidate) return;

      const pc = pcRef.current;
      if (!pc) {
        pendingIceRef.current.push(candidate); // ✅ queue
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    const onEnd = () => {
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
            </div>
          </div>
        ) : null}

        {status === "ringing" && incomingFrom && (
          <div className="mt-3 flex gap-3 items-center">
            <span>
              Incoming call from <b>{incomingFrom}</b>
            </span>

            <button
              onClick={() => acceptIncoming(incomingFrom)}
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
