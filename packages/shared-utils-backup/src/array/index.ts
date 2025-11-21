export function sortByLocale<T>(list: T[], selector?: (item: T) => string): T[] {
  const mapper = selector ?? ((item: T) => String(item ?? ''));

  return [...list].sort((a, b) => {
    const left = mapper(a) ?? '';
    const right = mapper(b) ?? '';
    return left.localeCompare(right, undefined, { sensitivity: 'base' });
  });
}
