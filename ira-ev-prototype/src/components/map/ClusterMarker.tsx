interface ClusterMarkerProps {
  count: number;
  x: number;
  y: number;
  onClick: () => void;
}

export function ClusterMarker({ count, x, y, onClick }: ClusterMarkerProps) {
  const size = count >= 10 ? 52 : 44;

  return (
    <button
      onClick={onClick}
      aria-label={`${count} charging stations, tap to zoom in`}
      data-cluster-marker="true"
      data-cluster-x={x}
      data-cluster-y={y}
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
    >
      <span className="text-black font-bold text-[15px]">{count}</span>
    </button>
  );
}
