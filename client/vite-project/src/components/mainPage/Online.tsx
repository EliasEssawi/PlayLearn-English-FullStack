import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useCall } from "../call/CallProvider";

type OnlineProps = { darkMode: boolean };

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

    const name =
      (typeof p?.profileName === "string" && p.profileName.trim()) ||
      (typeof p?.email?.profileName === "string" && p.email.profileName.trim()) ||
      "Player";

    const rate =
      p?.rate ??
      p?.email?.rate ??
      p?.level ??
      p?.email?.level ??
      p?.email?.progress?.level ??
      1;

    return { username: name, rate: clampRate(rate) };
  } catch {
    return { username: "Player", rate: 1 };
  }
}

function dedupePlayers(list: any): Player[] {
  const arr: Player[] = Array.isArray(list) ? list : [];
  const map = new Map<string, Player>();
  for (const p of arr) {
    const id = String(p?.socketId || "");
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, {
        name: String(p?.name || "Player"),
        socketId: id,
        rate: clampRate(p?.rate),
      });
    }
  }
  return Array.from(map.values());
}

export default function Online({ darkMode }: OnlineProps) {
  // ✅ Use the ONE shared socket from CallProvider
  const { socket, incomingFrom, showIncomingBar, onOpenFromBar, onDeclineFromBar } = useCall();

  const [connected, setConnected] = useState<boolean>(socket.connected);

  // profile
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
  const [mySocketId, setMySocketId] = useState<string>(socket.id || "");
  const [locked, setLocked] = useState(false);

  // load profile on mount
  useEffect(() => {
    const p = readProfileFromLS();
    setUsername(p.username);
    setRate(p.rate);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeProfile") {
        const np = readProfileFromLS();
        setUsername(np.username);
        setRate(np.rate);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ Attach ONLY Online listeners. DO NOT disconnect socket here.
  useEffect(() => {
    // in case already connected
    setConnected(socket.connected);
    if (socket.id) setMySocketId(socket.id);

    const onConnect = () => {
      setConnected(true);
      if (socket.id) setMySocketId(socket.id);
      setStatus("Connected. Ready to find a match.");
    };

    const onDisconnect = () => {
      setConnected(false);
      setStatus("Disconnected.");
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setScores({});
      setLocked(false);
    };

    const onMatchWaiting = (p: any) => setStatus(String(p?.message || "Waiting..."));

    const onMatchFound = (p: any) => {
      setRoomId(String(p?.roomId || ""));
      setPlayers(dedupePlayers(p?.players));
      setStatus(`Match found! Rate=${Number(p?.rate) || rate}`);
      setNotify("🎮 Match started!");
      setScores({});
      setRound(0);
      setQuestion(null);
      setEndsAt(0);
      setLocked(false);
    };

    const onMatchError = (p: any) => {
      const msg = String(p?.message || "Match error.");
      setStatus(msg);
      setNotify(msg);
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setScores({});
      setLocked(false);
    };

    const onRoundStart = (p: any) => {
      setRound(Number(p?.round || 0));
      setTotalRounds(Number(p?.totalRounds || 10));
      setQuestion(p?.question || null);
      setEndsAt(Number(p?.endsAt || 0));
      setLocked(false);
      setNotify("");
      if (Array.isArray(p?.players)) setPlayers(dedupePlayers(p.players));
    };

    const onGameState = (p: any) => {
      if (p?.scores) setScores(p.scores);
      if (p?.endsAt) setEndsAt(Number(p.endsAt));
      if (Array.isArray(p?.players)) setPlayers(dedupePlayers(p.players));
    };

    const onNotify = (p: any) => setNotify(String(p?.text || ""));

    const onLocked = () => {
      setLocked(true);
      setTimeout(() => setLocked(false), 5000);
    };

    const onAnswerRejected = (p: any) => {
      const r = String(p?.reason || "");
      if (r === "locked") setNotify("⏳ You are locked for 5 seconds.");
      if (r === "already_answered") setNotify("✅ You already answered this round.");
    };

    const onRoundEnd = () => {
      setQuestion(null);
      setEndsAt(0);
    };

    const onGameOver = (p: any) => {
      const winner = p?.winner?.name ? `🏆 Winner: ${p.winner.name}` : "🤝 Draw!";
      setNotify(winner);
      setStatus("Game finished.");
      setRoomId("");
      setPlayers([]);
      setQuestion(null);
      setEndsAt(0);
      setLocked(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("match_waiting", onMatchWaiting);
    socket.on("match_found", onMatchFound);
    socket.on("match_error", onMatchError);

    socket.on("round_start", onRoundStart);
    socket.on("game_state", onGameState);
    socket.on("notify", onNotify);
    socket.on("locked", onLocked);
    socket.on("answer_rejected", onAnswerRejected);
    socket.on("round_end", onRoundEnd);
    socket.on("game_over", onGameOver);

    return () => {
      // ✅ remove ONLY Online listeners
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      socket.off("match_waiting", onMatchWaiting);
      socket.off("match_found", onMatchFound);
      socket.off("match_error", onMatchError);

      socket.off("round_start", onRoundStart);
      socket.off("game_state", onGameState);
      socket.off("notify", onNotify);
      socket.off("locked", onLocked);
      socket.off("answer_rejected", onAnswerRejected);
      socket.off("round_end", onRoundEnd);
      socket.off("game_over", onGameOver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

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
    if (!connected) return;

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

    socket.emit("join_game", { name: p.username, rate: p.rate });
  };

  const answer = (opt: string) => {
    if (!roomId || !question) return;
    if (locked) return;
    socket.emit("answer", { roomId, questionId: question._id, option: opt });
  };

  const bg = darkMode ? "#020617" : "#ffffff";
  const border = darkMode ? "1px solid #334155" : "1px solid #e2e8f0";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const sub = darkMode ? "#94a3b8" : "#475569";

  const myScore = scores[mySocketId] ?? 0;

  const opponent = useMemo(() => {
    return players.find((p) => p.socketId && p.socketId !== mySocketId);
  }, [players, mySocketId]);

  const oppScore = opponent ? (scores[opponent.socketId] ?? 0) : 0;
  const hasOpponent = !!opponent?.socketId;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Incoming call bar (from CallProvider) */}
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
            {username}{" "}
            <span style={{ color: sub, fontWeight: 700 }}>vs {opponent?.name ?? "Waiting opponent..."}</span>
            <span style={{ color: sub, fontWeight: 700, marginLeft: 10 }}>
              • Score {myScore}:{oppScore}
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
              <div style={{ marginTop: 10, color: sub, fontWeight: 700 }}>⏳ Waiting for another player to join...</div>
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
