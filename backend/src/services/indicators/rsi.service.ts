// backend/src/services/indicators/rsi.service.ts

export function calculateRsi(values: number[], period: number): Array<number | null> {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
  }

  const result: Array<number | null> = values.map(() => null);
  if (values.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }

  gains /= period;
  losses /= period;
  result[period] = toRsi(gains, losses);

  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    gains = (gains * (period - 1) + Math.max(change, 0)) / period;
    losses = (losses * (period - 1) + Math.max(-change, 0)) / period;
    result[index] = toRsi(gains, losses);
  }

  return result;
}

function toRsi(averageGain: number, averageLoss: number): number {
  if (averageLoss === 0) {
    return 100;
  }

  return Number((100 - 100 / (1 + averageGain / averageLoss)).toFixed(6));
}