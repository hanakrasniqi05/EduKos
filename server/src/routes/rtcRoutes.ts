import { Router } from "express";
import type { Server } from "socket.io";
import { publishInternalEvent } from "../controllers/internalEventController.js";

export function createRtcRoutes(io: Server) {
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({ status: "ok", transport: "socket.io", persistence: "sql-server" });
  });

  router.post("/internal/events", (request, response) =>
    publishInternalEvent(io, request, response));

  return router;
}
