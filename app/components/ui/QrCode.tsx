/**
 * Decorative, deterministic QR-style graphic rendered as SVG.
 * No dependency, no network — a stand-in for the real ticket QR.
 */

const SIZE = 21;
const SEED = 20260408;

function buildMatrix(): boolean[][] {
  let state = SEED;
  const rnd = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const matrix: boolean[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => rnd() > 0.52),
  );

  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[oy + y][ox + x] = edge || core;
      }
    }
    // Quiet separators around each finder pattern.
    if (oy + 7 < SIZE) {
      for (let i = 0; i < 8; i += 1) {
        const cx = ox + i;
        if (cx >= 0 && cx < SIZE) matrix[oy + 7][cx] = false;
      }
    }
    if (ox + 7 < SIZE) {
      for (let i = 0; i < 8; i += 1) {
        const cy = oy + i;
        if (cy >= 0 && cy < SIZE) matrix[cy][ox + 7] = false;
      }
    }
  };

  finder(0, 0);
  finder(SIZE - 7, 0);
  finder(0, SIZE - 7);

  return matrix;
}

const MATRIX = buildMatrix();

export default function QrCode({
  className = "",
  color = "#1c293c",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label="Ticket QR code"
      shapeRendering="crispEdges"
    >
      <rect width={SIZE} height={SIZE} fill="transparent" />
      {MATRIX.flatMap((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              rx={0.22}
              fill={color}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
