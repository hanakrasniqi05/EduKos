import type { Socket } from "socket.io";

export type AuthenticatedSocket = Socket & {
  data: {
    userId: number;
    roles: string[];
    token: string;
  };
};

export type SocketAcknowledgement<T = unknown> = (response: {
  ok: boolean;
  data?: T;
  message?: string;
}) => void;
