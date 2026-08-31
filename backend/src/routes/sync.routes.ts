import { Router } from "express";

import { SyncController } from "../controllers/sync.controller.js";

const router = Router();
const controller = new SyncController();

router.post("/assets/:symbol", (req, res) => controller.syncAsset(req, res));

export const syncRoutes = router;
