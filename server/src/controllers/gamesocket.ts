import type { Server, Socket } from "socket.io";
import { Exercise } from "../models/Exercise";

type Player = { socketId: string; name: string; rate: number };

type RoomState = {
  roomId: string;
  rate: number;
  players: [Player, Player];
  questions: any[];
  roundIndex: number;
  scores: Record<string, number>; // socketId -> score
  answered: Record<string, boolean>; // socketId -> answered this round
  lockedUntil: Record<string, number>; // socketId -> timestamp ms
  roundEndsAt: number; // timestamp ms
};

const waitingByRate = new Map<number, Player>(); // rate -> player waiting
const rooms = new Map<string, RoomState>();

const TOTAL_ROUNDS = 10;
const ROUND_TIME_MS = 15000;     // you can change
const WRONG_LOCK_MS = 5000;      // 5 seconds
const MAX_PER_ROOM = 2;

function now() {
  return Date.now();
}

function safeName(x: any) {
  const s = String(x ?? "").trim();
  return s ? s.slice(0, 20) : "Player";
}

function clampRate(x: any) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.floor(n)));
}

function roomId(rate: number) {
  return `game_${rate}_${Math.random().toString(36).slice(2, 10)}`;
}

async function loadQuestions(rate: number) {
  //  collection is "exercises" (model Exercise)
  // filter by type + level
  // random 10
  const qs = await Exercise.aggregate([
    { $match: { type: "online", level: rate } },
    { $sample: { size: TOTAL_ROUNDS } },
    { $project: { prompt: 1, options: 1, answer: 1, level: 1, topic: 1, type: 1 } }
  ]);

  return qs;
}

function publicQuestion(q: any) {
  // do NOT send answer to clients
  return {
    _id: String(q._id),
    prompt: q.prompt,
    options: q.options,
    level: q.level,
    topic: q.topic,
    type: q.type,
  };
}

function isLocked(state: RoomState, socketId: string) {
  return (state.lockedUntil[socketId] || 0) > now();
}

function bothAnsweredOrTimeUp(state: RoomState) {
  const [a, b] = state.players;
  const aAns = !!state.answered[a.socketId];
  const bAns = !!state.answered[b.socketId];
  return (aAns && bAns) || now() >= state.roundEndsAt;
}

function emitState(io: Server, state: RoomState) {
  io.to(state.roomId).emit("game_state", {
    roomId: state.roomId,
    rate: state.rate,
    round: state.roundIndex + 1,
    totalRounds: TOTAL_ROUNDS,
    scores: state.scores,
    endsAt: state.roundEndsAt,
    players: state.players.map(p => ({ name: p.name, rate: p.rate, socketId: p.socketId })),
  });
}

function startRound(io: Server, state: RoomState) {
  state.answered = {};
  state.roundEndsAt = now() + ROUND_TIME_MS;

  const q = state.questions[state.roundIndex];
  io.to(state.roomId).emit("round_start", {
    round: state.roundIndex + 1,
    totalRounds: TOTAL_ROUNDS,
    question: publicQuestion(q),
    endsAt: state.roundEndsAt,
  });

  emitState(io, state);

  // hard timeout - move on if nobody finishes
  setTimeout(() => {
    const current = rooms.get(state.roomId);
    if (!current) return;
    if (current.roundIndex !== state.roundIndex) return; // already moved
    if (bothAnsweredOrTimeUp(current)) {
      endRound(io, current, { reason: "timeout" });
    }
  }, ROUND_TIME_MS + 50);
}

function endRound(io: Server, state: RoomState, meta?: any) {
  io.to(state.roomId).emit("round_end", {
    round: state.roundIndex + 1,
    scores: state.scores,
    reason: meta?.reason || "done",
  });

  state.roundIndex += 1;

  if (state.roundIndex >= TOTAL_ROUNDS) {
    // game finished
    const [p1, p2] = state.players;
    const s1 = state.scores[p1.socketId] || 0;
    const s2 = state.scores[p2.socketId] || 0;
    let winner: any = null;
    if (s1 > s2) winner = { socketId: p1.socketId, name: p1.name };
    else if (s2 > s1) winner = { socketId: p2.socketId, name: p2.name };

    io.to(state.roomId).emit("game_over", { scores: state.scores, winner });
    rooms.delete(state.roomId);
    return;
  }

  // next round
  setTimeout(() => startRound(io, state), 800);
}

export function gameSocket(io: Server, socket: Socket) {
  // join_game: { name, rate }
  socket.on("join_game", async (payload: any) => {
    const name = safeName(payload?.name);
    const rate = clampRate(payload?.rate);

    // if already in waiting, ignore
    if ([...waitingByRate.values()].some(p => p.socketId === socket.id)) return;

    // try to match
    const waiting = waitingByRate.get(rate);

    if (!waiting) {
      waitingByRate.set(rate, { socketId: socket.id, name, rate });
      socket.emit("match_waiting", { message: `Waiting for another player (rate ${rate})...`, rate });
      return;
    }

    // do not match same socket
    if (waiting.socketId === socket.id) {
      socket.emit("match_waiting", { message: `Waiting for another player (rate ${rate})...`, rate });
      return;
    }

    // remove waiting
    waitingByRate.delete(rate);

    // create room
    const rid = roomId(rate);
    await socket.join(rid);
    const other = io.sockets.sockets.get(waiting.socketId);
    if (!other) {
      // other disconnected
      socket.emit("match_waiting", { message: `Other player left. Waiting again...`, rate });
      waitingByRate.set(rate, { socketId: socket.id, name, rate });
      return;
    }

    // join other
    const size = (await io.in(rid).fetchSockets()).length;
    if (size >= MAX_PER_ROOM) {
      socket.emit("match_error", { message: "Room full." });
      return;
    }

    await other.join(rid);

    // load questions from DB
    const qs = await loadQuestions(rate);
    if (!qs || qs.length < TOTAL_ROUNDS) {
      io.to(rid).emit("match_error", { message: "Not enough online questions for this rate." });
      return;
    }

    const state: RoomState = {
      roomId: rid,
      rate,
      players: [
        { socketId: waiting.socketId, name: waiting.name, rate },
        { socketId: socket.id, name, rate },
      ],
      questions: qs,
      roundIndex: 0,
      scores: { [waiting.socketId]: 0, [socket.id]: 0 },
      answered: {},
      lockedUntil: {},
      roundEndsAt: 0,
    };

    rooms.set(rid, state);

    io.to(rid).emit("match_found", {
      roomId: rid,
      rate,
      players: state.players.map(p => ({ name: p.name, socketId: p.socketId, rate: p.rate })),
    });

    startRound(io, state);
  });

  // answer: { roomId, questionId, option }
  socket.on("answer", (payload: any) => {
    const rid = String(payload?.roomId || "");
    const state = rooms.get(rid);
    if (!state) return;

    // must be in room
    const isPlayer = state.players.some(p => p.socketId === socket.id);
    if (!isPlayer) return;

    // lock check
    if (isLocked(state, socket.id)) {
      socket.emit("answer_rejected", { reason: "locked" });
      return;
    }

    // already answered this round
    if (state.answered[socket.id]) {
      socket.emit("answer_rejected", { reason: "already_answered" });
      return;
    }

    const q = state.questions[state.roundIndex];
    const chosen = String(payload?.option ?? "");
    const correct = chosen === String(q.answer);

    state.answered[socket.id] = true;

    if (correct) {
      state.scores[socket.id] = (state.scores[socket.id] || 0) + 1;

      io.to(state.roomId).emit("notify", {
        text: `✅ ${state.players.find(p => p.socketId === socket.id)?.name || "Player"} got it RIGHT! (+1)`,
      });

      emitState(io, state);

      // if first correct, end round immediately (still allow other to "see")
      endRound(io, state, { reason: "correct" });
      return;
    }

    // wrong -> lock that player for 5 seconds (BUT NO -1 unless the other got it right first)
    state.lockedUntil[socket.id] = now() + WRONG_LOCK_MS;

    io.to(state.roomId).emit("notify", {
      text: `❌ ${state.players.find(p => p.socketId === socket.id)?.name || "Player"} got it WRONG! (locked 5s)`,
    });

    socket.emit("locked", { ms: WRONG_LOCK_MS });

    emitState(io, state);

    // If both answered and both wrong => no penalty, end round
    if (bothAnsweredOrTimeUp(state)) {
      endRound(io, state, { reason: "both_answered" });
    }
  });

  socket.on("disconnect", () => {
    // remove from waiting queue
    for (const [rate, p] of waitingByRate.entries()) {
      if (p.socketId === socket.id) waitingByRate.delete(rate);
    }

    // if player was in a room -> end game for other
    for (const [rid, state] of rooms.entries()) {
      const isPlayer = state.players.some(p => p.socketId === socket.id);
      if (!isPlayer) continue;

      io.to(rid).emit("match_error", { message: "Opponent disconnected. Game ended." });
      rooms.delete(rid);
    }
  });
}
