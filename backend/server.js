import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { socketConnection } from "./sockets/socketConnection.js";
import routes from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

socketConnection(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  });
}).catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});