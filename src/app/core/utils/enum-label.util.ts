export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  return value
    .split('_')
    .map((segment) => {
      const lowerSegment = segment.toLowerCase();
      return lowerSegment.charAt(0).toUpperCase() + lowerSegment.slice(1);
    })
    .join(' ');
}
