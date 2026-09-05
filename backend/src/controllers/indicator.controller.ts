import type { Request, Response } from "express";

import { MarketIndicatorService } from "../services/indicators/market-indicator.service.js";

export class IndicatorController {
  constructor(
    private readonly indicatorService = new MarketIndicatorService()
  ) {}

  async getSma(req: Request, res: Response): Promise<void> {
    try {
      const symbol = this.getSymbol(req);

      const interval =
        typeof req.query.interval === "string"
          ? req.query.interval
          : "1day";

      const period =
        typeof req.query.period === "string"
          ? Number(req.query.period)
          : 14;

      if (!Number.isInteger(period) || period <= 0) {
        res.status(400).json({
          error: "period must be a positive integer."
        });
        return;
      }

      const result = await this.indicatorService.getSma(
        symbol,
        interval,
        period
      );

      res.json({ data: result });
    } catch (error) {
      this.handleError(res, error, "SMA");
    }
  }

  async getEma(req: Request, res: Response): Promise<void> {
    try {
      const symbol = this.getSymbol(req);

      const interval =
        typeof req.query.interval === "string"
          ? req.query.interval
          : "1day";

      const period =
        typeof req.query.period === "string"
          ? Number(req.query.period)
          : 14;

      if (!Number.isInteger(period) || period <= 0) {
        res.status(400).json({
          error: "period must be a positive integer."
        });
        return;
      }

      const result = await this.indicatorService.getEma(
        symbol,
        interval,
        period
      );

      res.json({ data: result });
    } catch (error) {
      this.handleError(res, error, "EMA");
    }
  }

  async getRsi(req: Request, res: Response): Promise<void> {
    try {
      const symbol = this.getSymbol(req);

      const interval =
        typeof req.query.interval === "string"
          ? req.query.interval
          : "1day";

      const period =
        typeof req.query.period === "string"
          ? Number(req.query.period)
          : 14;

      if (!Number.isInteger(period) || period <= 0) {
        res.status(400).json({
          error: "period must be a positive integer."
        });
        return;
      }

      const result = await this.indicatorService.getRsi(
        symbol,
        interval,
        period
      );

      res.json({ data: result });
    } catch (error) {
      this.handleError(res, error, "RSI");
    }
  }

  private getSymbol(req: Request): string {
    const symbol = Array.isArray(req.params.symbol)
      ? req.params.symbol[0]
      : req.params.symbol;

    if (!symbol || !symbol.trim()) {
      throw new Error("SYMBOL_REQUIRED");
    }

    return symbol;
  }

  private handleError(
    res: Response,
    error: unknown,
    indicator: string
  ): void {
    if (
      error instanceof Error &&
      error.message === "SYMBOL_REQUIRED"
    ) {
      res.status(400).json({
        error: "A market symbol is required."
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "PERIOD_MUST_BE_POSITIVE_INTEGER"
    ) {
      res.status(400).json({
        error: "period must be a positive integer."
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "HISTORY_NOT_FOUND"
    ) {
      res.status(404).json({
        error:
          "No persisted market history was found for this symbol and interval."
      });
      return;
    }

    console.error(
      `Unexpected ${indicator} indicator error`,
      error
    );

    res.status(500).json({
      error: `Unable to calculate ${indicator} indicator.`
    });
  }
}
