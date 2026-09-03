export function calculateEma(values: number[], period: number): Array<number | null> {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
  }

  const result: Array<number | null> = values.map(() => null);
  if (values.length < period) {
    return result;
  }

  const initialAverage = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  const multiplier = 2 / (period + 1);
  result[period - 1] = Number(initialAverage.toFixed(6));

  for (let index = period; index < values.length; index += 1) {
    const previous = result[index - 1];
    if (previous !== null) {
      result[index] = Number(((values[index] - previous) * multiplier + previous).toFixed(6));
    }
  }

  return result;
}