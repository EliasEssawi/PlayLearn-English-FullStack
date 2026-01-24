import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

type OnlineProps = { darkMode: boolean };

// ✅ client .env: VITE_SOCKET_URL=http://localhost:5001
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

type Player = { name: string; socketId: string; rate: number };

type Question = {
  _id: string;
  prompt: string;
  options: string[];
  level: number;
  topic: string;
  type: string;
};

function clampRate(x: any): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.floor(n)));
}

function readProfileFromLS(): { username: string; rate: number } {
  const raw = localStorage.getItem("activeProfile");
  if (!raw) return { username: "Player", rate: 1 };

  try {
    const p = JSON.parse(raw);

    // ✅ Support both shapes:
    // 1) { profileName, rate, ... }
    // 2) { email: { profileName, rate, ... } }
    const name =
      (typeof p?.profileName === "string" && p.profileName.trim()) ||
      (typeof p?.email?.profileName === "string" && p.email.profileName.trim()) ||
      "Player";

    const rate =
      p?.rate ?? p?.email?.rate ?? p?.level ?? p?.email?.level ?? p?.email?.progress?.level ?? 1;

    return { username: name, rate: clampRate(rate) };
  } catch {
    return { username: "Player", rate: 1 };
  }
}

export default function Online({ darkMode }: OnlineProps) {
  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);

  // ✅ profile
  const [username, setUsername] = useState("Player");
  const [rate, setRate] = useState<number>(1);

  // matchmaking/game
  const [roomId, setRoomId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<string>("Not in match yet.");
  const [notify, setNotify] = useState<string>("");

  // round
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [question, setQuestion] = useState<Question | null>(null);
  const [endsAt, setEndsAt] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // scoring/locking
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mySocketId, setMySocketId] = useState<string>("");
  const [locked, setLocked] = useState(false);

  // ✅ load profile on mount + when localStorage changes (login/profile switch)
  useEffect(() => {
    const apply = () => {
      const p = readProfileFromLS();
      setUsername(p.username);
      setRate(p.rate);
    };

    apply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeProfile") apply();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // connect once
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (socket.id) setMySocketId(socket.id);
      setStatus("Connected. Ready to find a match.");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setStatus("Disconnected.");
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setScores({});
      setLocked(false);
    });

    // ---- match events ----
    socket.on("match_waiting", (p: any) => setStatus(String(p?.message || "Waiting...")));

    socket.on("match_found", (p: any) => {
      setRoomId(String(p?.roomId || ""));
      setPlayers(Array.isArray(p?.players) ? p.players : []);
      setStatus(`Match found! Rate=${Number(p?.rate) || rate}`);
      setNotify("🎮 Match started!");
      setScores({});
      setRound(0);
      setQuestion(null);
      setEndsAt(0);
      setLocked(false);
    });

    socket.on("match_error", (p: any) => {
      const msg = String(p?.message || "Match error.");
      setStatus(msg);
      setNotify(msg);
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setScores({});
      setLocked(false);
    });

    // ---- game events ----
    socket.on("round_start", (p: any) => {
      setRound(Number(p?.round || 0));
      setTotalRounds(Number(p?.totalRounds || 10));
      setQuestion(p?.question || null);
      setEndsAt(Number(p?.endsAt || 0));
      setLocked(false);
      setNotify("");
    });

    socket.on("game_state", (p: any) => {
      if (p?.scores) setScores(p.scores);
      if (p?.endsAt) setEndsAt(Number(p.endsAt));
      if (Array.isArray(p?.players)) setPlayers(p.players);
    });

    socket.on("notify", (p: any) => setNotify(String(p?.text || "")));

    socket.on("locked", () => {
      setLocked(true);
      setTimeout(() => setLocked(false), 5000);
    });

    socket.on("answer_rejected", (p: any) => {
      const r = String(p?.reason || "");
      if (r === "locked") setNotify("⏳ You are locked for 5 seconds.");
      if (r === "already_answered") setNotify("✅ You already answered this round.");
    });

    socket.on("round_end", () => {
      setQuestion(null);
      setEndsAt(0);
    });

    socket.on("game_over", (p: any) => {
      const winner = p?.winner?.name ? `🏆 Winner: ${p.winner.name}` : "🤝 Draw!";
      setNotify(winner);
      setStatus("Game finished.");
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setLocked(false);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown timer
  useEffect(() => {
    if (!endsAt) {
      setSecondsLeft(0);
      return;
    }
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(s);
    }, 250);
    return () => clearInterval(t);
  }, [endsAt]);

  const join = () => {
    if (!socketRef.current || !connected) return;

    // ✅ re-read profile right before joining (guaranteed correct)
    const p = readProfileFromLS();
    setUsername(p.username);
    setRate(p.rate);

    setStatus("Searching match...");
    setNotify("");
    setRoomId("");
    setPlayers([]);
    setQuestion(null);
    setEndsAt(0);
    setScores({});
    setLocked(false);

    socketRef.current.emit("join_game", { name: p.username, rate: p.rate });
  };

  const answer = (opt: string) => {
    if (!socketRef.current || !roomId || !question) return;
    if (locked) return;
    socketRef.current.emit("answer", { roomId, questionId: question._id, option: opt });
  };

  const bg = darkMode ? "#020617" : "#ffffff";
  const border = darkMode ? "1px solid #334155" : "1px solid #e2e8f0";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const sub = darkMode ? "#94a3b8" : "#475569";

  const myScore = scores[mySocketId] ?? 0;
  const opponent = players.find((p) => p.socketId !== mySocketId);
  const oppScore = opponent ? (scores[opponent.socketId] ?? 0) : 0;

  const hasOpponent = !!opponent?.socketId;

return (
  <div className="max-w-3xl mx-auto space-y-4">
    {/* Header / Matchmaking */}
    <div style={{ border, background: bg, borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ color: textColor, fontWeight: 900, fontSize: 22 }}>Online 1v1</div>
          <div style={{ color: sub, fontSize: 13 }}>
            You: <b>{username}</b> • Rate: <b>{rate}</b> • {connected ? "✅ Connected" : "❌ Offline"}
          </div>
          <div style={{ color: sub, fontSize: 13, marginTop: 4 }}>{status}</div>
        </div>

        <button
          onClick={join}
          disabled={!connected || !!roomId}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            fontWeight: 900,
            background: darkMode ? "#1e293b" : "#86e07f",
            color: darkMode ? "#f8fafc" : "#0f172a",
            opacity: !connected || !!roomId ? 0.6 : 1,
            cursor: !connected || !!roomId ? "not-allowed" : "pointer",
          }}
        >
          {roomId ? "In Match" : "Find Match"}
        </button>
      </div>

      {notify && (
        <div
          style={{
            marginTop: 10,
            color: textColor,
            background: darkMode ? "#0b1220" : "#f1f5f9",
            border,
            borderRadius: 12,
            padding: 10,
          }}
        >
          {notify}
        </div>
      )}
    </div>

    {/* Game Panel */}
    <div style={{ border, background: bg, borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ color: textColor, fontWeight: 900 }}>
          Round: {round}/{totalRounds}{" "}
          {endsAt ? <span style={{ color: sub, fontWeight: 700 }}>• Time: {secondsLeft}s</span> : null}
        </div>

        <div style={{ color: textColor, fontWeight: 900 }}>
          You: {myScore}{" "}
          <span style={{ color: sub, fontWeight: 700 }}>
            vs {opponent?.name ? `${opponent.name}: ${oppScore}` : "Waiting opponent..."}
          </span>
        </div>
      </div>

      {!question ? (
        <div style={{ marginTop: 14, color: sub, fontStyle: "italic" }}>
          {roomId ? "Next question is loading..." : "Click “Find Match” to start."}
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: textColor, fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
            {question.prompt}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {question.options.map((opt, i) => (
              <button
                key={`${question._id}-${i}`}
                onClick={() => answer(opt)}
                disabled={locked || !hasOpponent}
                style={{
                  padding: "12px 12px",
                  borderRadius: 12,
                  border,
                  background: darkMode ? "#0b1220" : "#ffffff",
                  color: textColor,
                  fontWeight: 800,
                  cursor: locked || !hasOpponent ? "not-allowed" : "pointer",
                  opacity: locked || !hasOpponent ? 0.7 : 1,
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {!hasOpponent && (
            <div style={{ marginTop: 10, color: sub, fontWeight: 700 }}>
              ⏳ Waiting for another player to join...
            </div>
          )}

          {locked && (
            <div style={{ marginTop: 10, color: sub, fontWeight: 700 }}>
              ⏳ You answered wrong — wait 5 seconds, opponent can try.
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}
