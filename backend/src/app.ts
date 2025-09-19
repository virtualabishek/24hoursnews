import express, { type Express } from "express";
import cors from "cors";
import scrapperRouter from "./routes/scrapper.route.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use("/api/scraper", scrapperRouter);

export default app;
