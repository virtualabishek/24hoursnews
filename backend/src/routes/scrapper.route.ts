import { Router, type Router as ExpressRouter } from "express";
import { triggerScrape } from "../controller/scrapper.controller.js";

const router: ExpressRouter = Router();

router.post("/start", triggerScrape);

export default router;
