// callSocket.ts
import type { Server, Socket } from "socket.io";

type UserId = string;

const userToSocket = new Map<UserId, string>();
const socketToUser = new Map<string, UserId>();

export function callSocket(io: Server, socket: Socket) {
  socket.on("user:online", ({ userId }: { userId: string }) => {
    if (!userId) return;
    userToSocket.set(userId, socket.id);
    socketToUser.set(socket.id, userId);
  });
  // callee accepted the call (notify caller)
socket.on("call:accept", ({ toUserId }: { toUserId: string }) => {
  const fromUserId = socketToUser.get(socket.id);
  if (!fromUserId) return;

  const toSocketId = userToSocket.get(toUserId);
  if (!toSocketId) return;

  io.to(toSocketId).emit("call:accept", { fromUserId });
});

// callee declined
socket.on("call:decline", ({ toUserId }: { toUserId: string }) => {
  const fromUserId = socketToUser.get(socket.id);
  if (!fromUserId) return;

  const toSocketId = userToSocket.get(toUserId);
  if (!toSocketId) return;

  io.to(toSocketId).emit("call:decline", { fromUserId });
});

  socket.on("call:request", ({ toUserId }: { toUserId: string }) => {
    const fromUserId = socketToUser.get(socket.id);
    if (!fromUserId) return;

    const toSocketId = userToSocket.get(toUserId);
    if (!toSocketId) return socket.emit("call:error", { message: "User offline" });

    io.to(toSocketId).emit("call:incoming", { fromUserId });
  });

  socket.on("call:offer", ({ toUserId, offer }: { toUserId: string; offer: any }) => {
    const fromUserId = socketToUser.get(socket.id);
    if (!fromUserId) return;

    const toSocketId = userToSocket.get(toUserId);
    if (!toSocketId) return;

    io.to(toSocketId).emit("call:offer", { fromUserId, offer });
  });
  
  socket.on("call:answer", ({ toUserId, answer }: { toUserId: string; answer: any }) => {
    const fromUserId = socketToUser.get(socket.id);
    if (!fromUserId) return;

    const toSocketId = userToSocket.get(toUserId);
    if (!toSocketId) return;

    io.to(toSocketId).emit("call:answer", { fromUserId, answer });
  });

  socket.on("call:ice", ({ toUserId, candidate }: { toUserId: string; candidate: any }) => {
    const fromUserId = socketToUser.get(socket.id);
    if (!fromUserId) return;

    const toSocketId = userToSocket.get(toUserId);
    if (!toSocketId) return;

    io.to(toSocketId).emit("call:ice", { fromUserId, candidate });
  });

  socket.on("call:end", ({ toUserId }: { toUserId: string }) => {
    const fromUserId = socketToUser.get(socket.id);
    if (!fromUserId) return;

    const toSocketId = userToSocket.get(toUserId);
    if (!toSocketId) return;

    io.to(toSocketId).emit("call:end", { fromUserId });
  });

  socket.on("disconnect", () => {
    const userId = socketToUser.get(socket.id);
    if (userId) userToSocket.delete(userId);
    socketToUser.delete(socket.id);
  });


  }
