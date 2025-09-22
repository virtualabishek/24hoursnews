import express, { type Express } from "express";
import cors from "cors";
import scrapperRouter from "./routes/scrapper.route.js";
import NewsRouter from "./routes/news.route.js";

const app: Express = express();

const allowedOrigins = ["http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/scraper", scrapperRouter);
app.use("/api/news", NewsRouter);

export default app;
