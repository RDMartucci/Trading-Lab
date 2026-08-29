import type { Request, Response } from "express";
import { AssetRepository } from "../repositories/asset.repository.js";

export class AssetsController {
  private assetRepository: AssetRepository;

  constructor() {
    this.assetRepository = new AssetRepository();
  }

  /**
   * GET /api/assets
   * Lista todos los activos en la base de datos
   */
  async listAssets(_req: Request, res: Response): Promise<void> {
    try {
      const assets = await this.assetRepository.getAllAssets();
      res.json({ data: assets, count: assets.length });
    } catch (error) {
      console.error("Error listing assets", error);
      res.status(500).json({ error: "Unable to retrieve assets." });
    }
  }

  /**
   * GET /api/assets/:symbol
   * Obtiene información de un activo específico
   */
  async getAsset(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol) 
        ? req.params.symbol[0] 
        : req.params.symbol;

      if (!symbol || symbol.trim().length === 0) {
        res.status(400).json({ error: "A symbol is required." });
        return;
      }

      const asset = await this.assetRepository.getAssetBySymbol(symbol);

      if (!asset) {
        res.status(404).json({
          error: `Asset with symbol ${symbol} not found.`
        });
        return;
      }

      res.json({ data: asset });
    } catch (error) {
      console.error("Error retrieving asset", error);
      res.status(500).json({ error: "Unable to retrieve asset." });
    }
  }

  /**
   * GET /api/assets/:symbol/stats
   * Obtiene información de un activo con estadísticas (cantidad de candles, fechas)
   */
  async getAssetWithStats(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol) 
        ? req.params.symbol[0] 
        : req.params.symbol;

      if (!symbol || symbol.trim().length === 0) {
        res.status(400).json({ error: "A symbol is required." });
        return;
      }

      const asset = await this.assetRepository.getAssetWithStats(symbol);

      if (!asset) {
        res.status(404).json({
          error: `Asset with symbol ${symbol} not found.`
        });
        return;
      }

      res.json({ data: asset });
    } catch (error) {
      console.error("Error retrieving asset stats", error);
      res.status(500).json({ error: "Unable to retrieve asset stats." });
    }
  }
}
