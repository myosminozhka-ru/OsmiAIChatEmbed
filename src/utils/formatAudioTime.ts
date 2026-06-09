export function formatAudioTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function toRgba(color: string, alpha: number): string {
  const match = color.match(/[\d.]+/g);
  if (!match || match.length < 3) return color;
  return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
}
