import { Router, type Router as ExpressRouter } from "express";
import * as newsController from "../controller/news.controller.js";

const router: ExpressRouter = Router();

router.get("/", newsController.getNews);

export default router;
