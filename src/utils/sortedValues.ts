export function sortedValues<T>(values: Record<string, T>): T[] {
  return Object.keys(values)
    .sort()
    .map((key) => values[key]);
}
