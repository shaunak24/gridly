/** Path colors for Color Flow — distinct from Word Hunt feedback colors. */
export const FLOW_PATH_COLORS = [
  '#F97316', // coral
  '#14B8A6', // teal
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#64748B', // slate
  '#EC4899', // pink
] as const;

export function colorHexForIndex(index: number): string {
  return FLOW_PATH_COLORS[index % FLOW_PATH_COLORS.length];
}
