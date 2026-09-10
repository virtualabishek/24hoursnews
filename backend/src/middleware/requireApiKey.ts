import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

function keysEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Shared-secret gate for the public news API.
 * The frontend (separate deploy) sends the same value via the `x-api-key`
 * header. Key lives only in env vars — never logged.
 */
export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.API_KEY;

  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      // Fail closed — boot check in server.ts should have prevented this.
      res.status(500).json({ error: "Server misconfigured" });
      return;
    }
    console.warn("[warn] API_KEY is not set — /api/news is open (dev only).");
    next();
    return;
  }

  const header = req.headers["x-api-key"];
  const provided = Array.isArray(header) ? header[0] : header;

  if (!provided || !keysEqual(provided, expected)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
