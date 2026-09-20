import express from "express";
import path from "path";

import { clerkMiddleware } from '@clerk/express'

import authRoutes from "./Routes/authRoutes";
import chatRoutes from "./Routes/chatRoutes";
import messageRoutes from "./Routes/messageRoutes";
import userRoutes from "./Routes/userRoues";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(clerkMiddleware());

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);


if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname,"../../web/dist")));

  app.get("/{*any}", (_, res)=>{
    res.sendFile(path.join(__dirname,"../../web/dist/index.html"))
  })
}

export default app;