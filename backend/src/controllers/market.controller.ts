import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { TwelveDataProviderError } from "../market-data/twelve-data-provider-error.js";
import { TwelveDataQuoteProvider } from "../market-data/twelve-data-quote-provider.js";
import { MarketHistoryService } from "../services/market/market-history.service.js";

export class MarketController {
  private quoteProvider: TwelveDataQuoteProvider;
  private historyService: MarketHistoryService;

  constructor() {
    this.quoteProvider = new TwelveDataQuoteProvider(env.twelveData.apiKey);
    this.historyService = new MarketHistoryService();
  }

  /**
   * GET /api/market/quote/:symbol
   * Obtiene la cotización actual de un activo desde Twelve Data
   */
  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol) 
        ? req.params.symbol[0] 
        : req.params.symbol;
      
      const quote = await this.quoteProvider.getQuote(symbol);
      res.json({ data: quote });
    } catch (error) {
      if (error instanceof Error && error.message === "TWELVE_DATA_API_KEY_MISSING") {
        res.status(503).json({ error: "Market data provider is not configured." });
        return;
      }

      if (error instanceof Error && error.message === "SYMBOL_REQUIRED") {
        res.status(400).json({ error: "A market symbol is required." });
        return;
      }

      if (error instanceof TwelveDataProviderError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error("Unexpected quote lookup error", error);
      res.status(502).json({ error: "Unable to retrieve the market quote." });
    }
  }

  /**
   * GET /api/market/history/:symbol
   * Obtiene el histórico de un activo desde Twelve Data y lo persiste en PostgreSQL
   */
  async getMarketHistory(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol) 
        ? req.params.symbol[0] 
        : req.params.symbol;
      
      const interval =
        typeof req.query.interval === "string" ? req.query.interval : "1day";

      const outputsize =
        typeof req.query.outputsize === "string"
          ? Number(req.query.outputsize)
          : 30;

      if (!Number.isInteger(outputsize) || outputsize < 1 || outputsize > 5000) {
        res.status(400).json({
          error: "outputsize must be an integer between 1 and 5000."
        });
        return;
      }

      const history = await this.historyService.getHistory(
        symbol,
        interval,
        outputsize
      );

      res.json({ data: history });
    } catch (error) {
      if (error instanceof Error && error.message === "TWELVE_DATA_API_KEY_MISSING") {
        res.status(503).json({ error: "Market data provider is not configured." });
        return;
      }

      if (error instanceof Error && error.message === "SYMBOL_REQUIRED") {
        res.status(400).json({ error: "A market symbol is required." });
        return;
      }

      if (error instanceof TwelveDataProviderError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error("Unexpected history lookup error", error);
      res.status(502).json({ error: "Unable to retrieve the market history." });
    }
  }

  /**
   * GET /api/market/candles/:symbol
   * Obtiene el histórico de un activo desde PostgreSQL (datos persistidos)
   */
  async getPersistedHistory(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol) 
        ? req.params.symbol[0] 
        : req.params.symbol;
      
      const interval =
        typeof req.query.interval === "string" ? req.query.interval : "1day";

      const limit =
        typeof req.query.limit === "string" ? Number(req.query.limit) : 30;

      if (!Number.isInteger(limit) || limit < 1 || limit > 5000) {
        res.status(400).json({
          error: "limit must be an integer between 1 and 5000."
        });
        return;
      }

      const history = await this.historyService.getPersistedHistory(
        symbol,
        interval,
        limit
      );

      res.json({ data: history });
    } catch (error) {
      if (error instanceof Error && error.message === "SYMBOL_REQUIRED") {
        res.status(400).json({ error: "A market symbol is required." });
        return;
      }

      console.error("Unexpected persisted history lookup error", error);
      res.status(502).json({ error: "Unable to retrieve the persisted history." });
    }
  }
}
