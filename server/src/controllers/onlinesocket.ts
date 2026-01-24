import { Server, Socket } from "socket.io";

type User = {
  id: string;
  name: string;
};

/* ======================
   GLOBAL (LOBBY) STATE
====================== */
const users: Record<string, User> = {};
const MAX_USERS = Number(process.env.MAX_ONLINE_USERS || 20);

/* ======================
   ROOM (GAME) STATE
====================== */
const MAX_PER_ROOM = 2;

export function onlineSocket(io: Server, socket: Socket) {
  /* ======================
     HARD LIMIT: TOTAL USERS
  ====================== */
  if (Object.keys(users).length >= MAX_USERS) {
    socket.emit("room_full", { message: "Server is full. Try again later." });
    socket.disconnect(true);
    return;
  }

  /* ======================
     REGISTER USER (LOBBY)
  ====================== */
  socket.on("username", (username: string) => {
    if (Object.keys(users).length >= MAX_USERS) {
      socket.emit("room_full", { message: "Server is full. Try again later." });
      socket.disconnect(true);
      return;
    }

    const user: User = {
      id: socket.id,
      name: (username || "Player").trim(),
    };

    users[socket.id] = user;

    io.emit("users", Object.values(users));
    io.emit("connected", user);
  });

  /* ======================
     LOBBY CHAT (GLOBAL)
     ❗ NOT AFFECTED BY ROOMS
  ====================== */
  socket.on("send", (message: string) => {
    const user = users[socket.id];
    if (!user) return;

    io.emit("message", {
      text: String(message || "").slice(0, 200),
      date: new Date().toISOString(),
      user,
    });
  });

  /* ======================
     JOIN 1v1 ROOM
  ====================== */
  socket.on("join_room", async (roomId: string) => {
    if (!roomId) return;

    const room = io.sockets.adapter.rooms.get(roomId);
    const size = room ? room.size : 0;

    if (size >= MAX_PER_ROOM) {
      socket.emit("room_full", { message: "This match is full." });
      return;
    }

    socket.join(roomId);

    socket.emit("room_joined", { roomId });
    socket.to(roomId).emit("room_player_joined", {
      id: socket.id,
      name: users[socket.id]?.name,
    });

    // Optional: start game automatically
    if (size + 1 === MAX_PER_ROOM) {
      io.to(roomId).emit("game_start", { roomId });
    }
  });

  /* ======================
     ROOM CHAT (OPTIONAL)
     ❗ ROOM ONLY
  ====================== */
  socket.on("room_message", ({ roomId, text }) => {
    const user = users[socket.id];
    if (!user || !roomId) return;

    io.to(roomId).emit("room_message", {
      text: String(text || "").slice(0, 200),
      date: new Date().toISOString(),
      user,
    });
  });

  /* ======================
     LEAVE ROOM
  ====================== */
  socket.on("leave_room", (roomId: string) => {
    socket.leave(roomId);
    socket.to(roomId).emit("room_player_left", socket.id);
  });

  /* ======================
     DISCONNECT
  ====================== */
  socket.on("disconnect", () => {
    delete users[socket.id];

    io.emit("users", Object.values(users));
    io.emit("disconnected", socket.id);
  });
}
