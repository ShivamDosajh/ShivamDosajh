/** Small deterministic string hash — used to derive stable "random-looking" mock values
 * (review sets, social-proof counts) that don't reshuffle on every render. */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
