export function requiredPositiveInteger(value: unknown, message: string) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(message);
  }
  return numberValue;
}

export function requiredMessageBody(value: unknown) {
  const body = typeof value === "string" ? value.trim() : "";
  if (!body) throw new Error("Mesazhi nuk eshte valid.");
  return body;
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
