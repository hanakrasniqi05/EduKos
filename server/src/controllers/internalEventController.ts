import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { rtcConfig } from "../config/rtcConfig.js";
import { publishableRtcEvents } from "../constants/rtcEvents.js";

export function publishInternalEvent(io: Server, request: Request, response: Response) {
  if (request.header("X-RTC-Internal-Secret") !== rtcConfig.internalSecret) {
    response.status(401).json({
      message: "Kredencialet e brendshme nuk jane valide.",
    });
    return;
  }

  const eventName = String(request.body?.eventName ?? "");
  const recipientUserIds = parseRecipientUserIds(request.body?.recipientUserIds);
  if (!publishableRtcEvents.has(eventName) || recipientUserIds.length === 0) {
    response.status(400).json({ message: "Eventi RTC nuk eshte valid." });
    return;
  }

  for (const userId of recipientUserIds) {
    io.to(`user:${userId}`).emit(eventName, request.body.payload);
  }

  const connectedRecipients = recipientUserIds.filter(
    (userId) => io.sockets.adapter.rooms.get(`user:${userId}`)?.size,
  );
  response.status(202).json({
    deliveredTo: recipientUserIds,
    connectedRecipients,
  });
}

function parseRecipientUserIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .map(Number)
      .filter((userId) => Number.isInteger(userId) && userId > 0),
  )];
}
