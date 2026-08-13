// Shared rail path math: normalizes rail point config and walks an N-point
// polyline using arc-length so movement speed stays consistent across
// segments of different lengths, regardless of caller (React admin preview,
// FPSControls runtime, or initial-position resolution).

export function normalizeRailPointsList(rawPoints) {
  if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
    return [
      { x: -2, y: 1.67, z: 0, order: 1 },
      { x: 1, y: 1.67, z: 0, order: 2 }
    ];
  }

  const cleaned = rawPoints.map((p, i) => ({
    x: Number.isFinite(Number(p?.x)) ? Number(p.x) : 0,
    y: Number.isFinite(Number(p?.y)) ? Number(p.y) : 1.67,
    z: Number.isFinite(Number(p?.z)) ? Number(p.z) : 0,
    order: Number.isFinite(Number(p?.order)) ? Number(p.order) : i + 1,
    _i: i
  }));

  cleaned.sort((a, b) => (a.order - b.order) || (a._i - b._i));

  const sequential = cleaned.map((p, idx) => ({ x: p.x, y: p.y, z: p.z, order: idx + 1 }));

  if (sequential.length < 2) {
    return [
      ...sequential,
      { x: (sequential[0]?.x ?? 0) + 1, y: sequential[0]?.y ?? 1.67, z: sequential[0]?.z ?? 0, order: 2 }
    ];
  }

  return sequential;
}

// Builds arc-length lookup for a point list. If loop is true, appends a
// closing segment back to the first point.
export function buildRailPath(points, loop = false) {
  const pts = Array.isArray(points) ? points.slice() : [];
  const pathPoints = loop && pts.length > 1 ? [...pts, pts[0]] : pts;

  const cumulative = [0];
  let total = 0;

  for (let i = 1; i < pathPoints.length; i++) {
    const dx = pathPoints[i].x - pathPoints[i - 1].x;
    const dy = pathPoints[i].y - pathPoints[i - 1].y;
    const dz = pathPoints[i].z - pathPoints[i - 1].z;
    const segLen = Math.sqrt(dx * dx + dy * dy + dz * dz);
    total += segLen;
    cumulative.push(total);
  }

  return {
    points: pathPoints,
    pointCount: pts.length,
    cumulative,
    totalLength: Math.max(0.0001, total)
  };
}

// Returns the {x, y, z} position at normalized progress t (0..1) along the path.
export function samplePathAtProgress(path, t) {
  const { points, cumulative, totalLength } = path;

  if (points.length === 0) return { x: 0, y: 1.67, z: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y, z: points[0].z };

  const clampedT = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
  const targetDist = clampedT * totalLength;

  for (let i = 1; i < points.length; i++) {
    if (targetDist <= cumulative[i] || i === points.length - 1) {
      const segStart = cumulative[i - 1];
      const segEnd = cumulative[i];
      const segLen = Math.max(0.0001, segEnd - segStart);
      const localT = Math.max(0, Math.min(1, (targetDist - segStart) / segLen));
      const a = points[i - 1];
      const b = points[i];
      return {
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
        z: a.z + (b.z - a.z) * localT
      };
    }
  }

  const last = points[points.length - 1];
  return { x: last.x, y: last.y, z: last.z };
}

// Converts a rail point's order number into a normalized 0..1 progress value.
export function progressForOrder(path, order) {
  if (path.totalLength <= 0 || path.pointCount === 0) return 0;

  const idx = Math.max(1, Math.round(Number(order) || 1)) - 1;
  const clampedIdx = Math.max(0, Math.min(path.pointCount - 1, idx));

  return path.cumulative[clampedIdx] / path.totalLength;
}
