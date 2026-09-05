// backend/src/routes/assets.routes.ts
import { Router } from "express";
import { AssetsController } from "../controllers/assets.controller.js";

const router = Router();
const controller = new AssetsController();

/**
 * GET /api/assets
 * Lista todos los activos en la base de datos
 */
router.get("/", (req, res) => controller.listAssets(req, res));

/**
 * GET /api/assets/:symbol/stats
 * Obtiene información de un activo con estadísticas
 */
router.get("/:symbol/stats", (req, res) => controller.getAssetWithStats(req, res));

/**
 * GET /api/assets/:symbol
 * Obtiene información de un activo específico
 */
router.get("/:symbol", (req, res) => controller.getAsset(req, res));

export const assetsRoutes = router;
