import "dotenv/config";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { rtcConfig } from "./config/rtcConfig.js";
import { createRtcRoutes } from "./routes/rtcRoutes.js";
import { registerRtcSocket } from "./sockets/rtcSocket.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: rtcConfig.clientOrigin,
    credentials: true,
  },
});

app.use(cors({ origin: rtcConfig.clientOrigin, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(createRtcRoutes(io));

registerRtcSocket(io);

httpServer.listen(rtcConfig.port, () => {
  console.log(`EduKos RTC po degjon ne http://localhost:${rtcConfig.port}`);
});
