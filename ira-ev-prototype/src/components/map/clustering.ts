import type { Station } from "../../types/charging";

export interface MapTransform {
  scale: number;
  x: number;
  y: number;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export interface StationCluster {
  id: string;
  stations: Station[];
  /** centroid in percentage coordinates (0-100), same space as Station.coordinates */
  centroid: { x: number; y: number };
}

const CLUSTER_PIXEL_THRESHOLD = 56;

/** Pre-transform pixel position of a percentage coordinate within the transformed layer. */
function toPrePixel(pct: { x: number; y: number }, size: ContainerSize) {
  return { x: (pct.x / 100) * size.width, y: (pct.y / 100) * size.height };
}

/** Screen-space pixel position after applying the current pan/scale transform. */
export function projectToScreen(pct: { x: number; y: number }, size: ContainerSize, transform: MapTransform) {
  const cx = size.width / 2;
  const cy = size.height / 2;
  const pre = toPrePixel(pct, size);
  return {
    x: cx + transform.scale * (pre.x - cx) + transform.x,
    y: cy + transform.scale * (pre.y - cy) + transform.y,
  };
}

/** Pan (x, y) that would center the given percentage point at the given scale. */
export function panToCenter(pct: { x: number; y: number }, size: ContainerSize, scale: number) {
  const cx = size.width / 2;
  const cy = size.height / 2;
  const pre = toPrePixel(pct, size);
  return { x: -scale * (pre.x - cx), y: -scale * (pre.y - cy) };
}

/** Simple greedy distance clustering — fine for a handful of mock stations. */
export function clusterStations(
  stations: Station[],
  size: ContainerSize,
  transform: MapTransform
): StationCluster[] {
  if (size.width === 0 || size.height === 0) {
    return stations.map((s) => ({ id: s.id, stations: [s], centroid: s.coordinates }));
  }

  const points = stations.map((s) => ({ station: s, screen: projectToScreen(s.coordinates, size, transform) }));
  const clusters: StationCluster[] = [];
  const used = new Set<string>();

  for (const point of points) {
    if (used.has(point.station.id)) continue;
    const members = [point.station];
    used.add(point.station.id);

    for (const other of points) {
      if (used.has(other.station.id)) continue;
      const dx = other.screen.x - point.screen.x;
      const dy = other.screen.y - point.screen.y;
      if (Math.hypot(dx, dy) < CLUSTER_PIXEL_THRESHOLD) {
        members.push(other.station);
        used.add(other.station.id);
      }
    }

    const centroid = {
      x: members.reduce((sum, s) => sum + s.coordinates.x, 0) / members.length,
      y: members.reduce((sum, s) => sum + s.coordinates.y, 0) / members.length,
    };
    clusters.push({ id: `cluster-${point.station.id}`, stations: members, centroid });
  }

  return clusters;
}
