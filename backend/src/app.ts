import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import scrapperRouter from "./routes/scrapper.route.js";
import NewsRouter from "./routes/news.route.js";
import { requireApiKey } from "./middleware/requireApiKey.js";

const app: Express = express();

// Behind cPanel's Apache/Passenger proxy — needed so rate limiting and
// logging see the real client IP instead of 127.0.0.1.
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://news.bhagawatin.com.np",
  "https://news.bhagawatin.com.np",
  "https://newsapi.bhagawatin.com.np",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean)
    : []),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow curl / mobile apps / same-origin (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
};

// Secure headers. crossOriginResourcePolicy must stay "cross-origin" — the
// frontend calls this API cross-origin from browsers, and the default
// "same-origin" policy would block those responses.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors(corsOptions));
app.use(express.json());

// Abuse guard: generous for normal browsing (homepage ≈ 2 req), blocks floods.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use("/api/", apiLimiter);

// Scrape trigger is expensive — tight cap on top of the secret check.
const scrapeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use("/api/scraper/", scrapeLimiter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "24hoursnews-backend" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/scraper", scrapperRouter);
// Shared-secret gate: frontend sends the same API_KEY via x-api-key header.
app.use("/api/news", requireApiKey, NewsRouter);

// Error handler must come last: turns CORS rejections into clean 403s and
// never leaks stack traces to clients.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error && err.message.startsWith("CORS blocked")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
