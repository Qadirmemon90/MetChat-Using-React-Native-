import express from "express";
import authRoutes from "./Routes/authRoutes";
import chatRoutes from "./Routes/chatRoutes";
import messageRoutes from "./Routes/messageRoutes";
import userRoutes from "./Routes/userRoues";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

export default app;