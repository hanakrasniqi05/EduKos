const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} duhet te konfigurohet.`);
  return value;
};

export const rtcConfig = {
  port: Number(process.env.RTC_PORT ?? 5060),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  apiBaseUrl: process.env.EDUKOS_API_URL ?? "http://localhost:5056",
  jwtKey: required("JWT_KEY"),
  jwtIssuer: process.env.JWT_ISSUER ?? "EduKos",
  jwtAudience: process.env.JWT_AUDIENCE ?? "EduKosUsers",
  internalSecret: required("RTC_INTERNAL_SECRET"),
} as const;
