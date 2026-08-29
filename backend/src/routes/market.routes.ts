import { Router } from "express";
import { MarketController } from "../controllers/market.controller.js";

const router = Router();
const controller = new MarketController();

/**
 * GET /api/market/quote/:symbol
 * Obtiene la cotización actual de un activo desde Twelve Data
 */
router.get("/quote/:symbol", (req, res) => controller.getQuote(req, res));

/**
 * GET /api/market/history/:symbol?interval=1day&outputsize=30
 * Obtiene el histórico de un activo desde Twelve Data y lo persiste en PostgreSQL
 */
router.get("/history/:symbol", (req, res) => controller.getMarketHistory(req, res));

/**
 * GET /api/market/candles/:symbol?interval=1day&limit=30
 * Obtiene el histórico de un activo desde PostgreSQL (datos persistidos)
 */
router.get("/candles/:symbol", (req, res) => controller.getPersistedHistory(req, res));

export const marketRoutes = router;
