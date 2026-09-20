import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

// store online users in memory  userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "https://localhost:8081", // Expo Mobie
    "https://localhost:5173", // Vite Web dev
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

  // verify socket connection  = if the user is autheniticaion, we will store he user id in the shocket

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // this is what user will send from client
    if (!token) return next(new Error("Authentication error"));

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = session.sub;

      const user = await User.findOne({ clerkId });
      if (!user) return next(new Error("User no found "));

      socket.data.userId = user._id.toString();

      next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  // this "connecion" event name is special and should be wrien like his
  // it's the even that is triggered when a new client connect to the server
  io.on("connecion", (socket) => {
    const userId = socket.data.userId;

    // send list of currently online users o he newly conneced client
    socket.emit("online-users", { userId: Array.from(onlineUsers.keys()) });

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });

          if (!chat) {
            socket.emit("socket-error", { Message: "Chat not forund" });
            return;
          }

          const message = await Message.create({
            chat: chatId,
            sender: userId,
            text,
          });

          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();

          await message.populate("sender", "name avatar");

          io.to(`chat:${chatId}`).emit("new-message", message);

          for (const participantId of chat.participants) {
            io.to(`user:${participantId}`).emit("new-message", message);
          }
        } catch (error) {
          socket.emit("socket-error", { message: "Failed to send message" });
        }
      },
    );

    // TODO: LATER
    socket.on("typing", async (data: any) => {});

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);

      // notify others
      socket.brodadcast.emit("user-offline", {userId}); 
    });
  });

  return io;
};
