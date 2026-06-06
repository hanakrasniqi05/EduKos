import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Socket } from "socket.io";
import { rtcConfig } from "../config/rtcConfig.js";
import type { AuthenticatedSocket } from "../types/rtcSocket.js";

const nameIdentifierClaim =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const roleClaim =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !token) {
    next(new Error("Kerkohet autentikimi."));
    return;
  }

  try {
    const payload = jwt.verify(token, rtcConfig.jwtKey, {
      issuer: rtcConfig.jwtIssuer,
      audience: rtcConfig.jwtAudience,
      algorithms: ["HS256"],
    }) as JwtPayload;
    const userId = Number(
      payload[nameIdentifierClaim] ?? payload.nameid ?? payload.sub,
    );

    if (!Number.isInteger(userId) || userId <= 0) {
      next(new Error("Tokeni nuk permban perdorues valid."));
      return;
    }

    const authenticatedSocket = socket as AuthenticatedSocket;
    authenticatedSocket.data.userId = userId;
    authenticatedSocket.data.roles = claimValues(payload[roleClaim] ?? payload.role);
    authenticatedSocket.data.token = token;
    next();
  } catch {
    next(new Error("Tokeni RTC nuk eshte valid."));
  }
}

function claimValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return value ? [String(value)] : [];
}
