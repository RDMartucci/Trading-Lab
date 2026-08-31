import type { Request, Response } from "express";

import { TwelveDataProviderError } from "../market-data/twelve-data-provider-error.js";
import { MarketHistoryService } from "../services/market/market-history.service.js";

export class SyncController {
  constructor(private readonly historyService = new MarketHistoryService()) {}

  async syncAsset(req: Request, res: Response): Promise<void> {
    try {
      const symbol = Array.isArray(req.params.symbol)
        ? req.params.symbol[0]
        : req.params.symbol;

      const interval = typeof req.query.interval === "string"
        ? req.query.interval
        : "1day";

      const outputsize = typeof req.query.outputsize === "string"
        ? Number(req.query.outputsize)
        : 30;

      if (!symbol || !symbol.trim()) {
        res.status(400).json({ error: "A market symbol is required." });
        return;
      }

      if (!Number.isInteger(outputsize) || outputsize < 1 || outputsize > 5000) {
        res.status(400).json({
          error: "outputsize must be an integer between 1 and 5000."
        });
        return;
      }

      const result = await this.historyService.syncHistory(symbol, interval, outputsize);
      res.status(200).json({ data: result });
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

      console.error("Unexpected sync asset error", error);
      res.status(502).json({ error: "Unable to synchronize the market asset." });
    }
  }
}
