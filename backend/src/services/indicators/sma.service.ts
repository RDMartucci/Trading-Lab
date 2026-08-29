export function calculateSma(values: number[], period: number): Array<number | null> {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("PERIOD_MUST_BE_POSITIVE_INTEGER");
  }

  if (values.length === 0) {
    return [];
  }

  const result: Array<number | null> = [];

  for (let index = 0; index < values.length; index += 1) {
    const start = index - period + 1;

    if (start < 0) {
      result.push(null);
      continue;
    }

    const window = values.slice(start, index + 1);
    const average = window.reduce((sum, value) => sum + value, 0) / window.length;
    result.push(Number(average.toFixed(6)));
  }

  return result;
}
