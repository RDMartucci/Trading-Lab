import { Router } from "express";

import { IndicatorController } from "../controllers/indicator.controller.js";

const router = Router();

const controller = new IndicatorController();

router.get("/sma/:symbol", (req, res) =>
  controller.getSma(req, res)
);

router.get("/ema/:symbol", (req, res) =>
  controller.getEma(req, res)
);

router.get("/rsi/:symbol", (req, res) =>
  controller.getRsi(req, res)
);

export const indicatorRoutes = router;