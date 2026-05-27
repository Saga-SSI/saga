export type TriDatum = { id: string; pts: string; shade: number };

const HEX_R = 130;
export const VW = 600;
export const VH = 300;

function lightZone(px: number, py: number): 0 | 1 | 2 {
  const t = (px / VW + py / VH) / 2;
  if (t < 0.38) return 0;
  if (t < 0.62) return 1;
  return 2;
}

export function buildHexMosaic(dx: number, dy: number): TriDatum[] {
  const colSpacing = Math.sqrt(3) * HEX_R;
  const rowSpacing = 1.5 * HEX_R;
  const out: TriDatum[] = [];
  let hi = 0;

  for (let row = -1; row <= 1; row++) {
    for (let col = -2; col <= 2; col++) {
      const cx =
        VW / 2 + dx + col * colSpacing + (Math.abs(row) % 2 === 1 ? colSpacing / 2 : 0);
      const cy = VH / 2 + dy + row * rowSpacing;

      for (let t = 0; t < 6; t++) {
        const a1 = Math.PI / 6 + t * (Math.PI / 3);
        const a2 = Math.PI / 6 + (t + 1) * (Math.PI / 3);
        const v1x = cx + HEX_R * Math.cos(a1);
        const v1y = cy + HEX_R * Math.sin(a1);
        const v2x = cx + HEX_R * Math.cos(a2);
        const v2y = cy + HEX_R * Math.sin(a2);
        const baseShade = (hi % 2 === 0 ? t : t + 1) % 3;
        const zone = lightZone((cx + v1x + v2x) / 3, (cy + v1y + v2y) / 3);
        out.push({
          id: `h${hi}t${t}`,
          pts: [
            `${cx.toFixed(1)},${cy.toFixed(1)}`,
            `${v1x.toFixed(1)},${v1y.toFixed(1)}`,
            `${v2x.toFixed(1)},${v2y.toFixed(1)}`,
          ].join(" "),
          shade: baseShade * 3 + zone,
        });
      }
      hi++;
    }
  }

  return out;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function mosaicParamsFromSeed(seed: string) {
  const hash = hashString(seed);
  return {
    rot: hash % 61,
    dx: (hash % 201) - 100,
    dy: ((hash >> 4) % 161) - 80,
    triangles: buildHexMosaic((hash % 201) - 100, ((hash >> 4) % 161) - 80),
  };
}

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    return [
      parseInt(normalized[0] + normalized[0], 16),
      parseInt(normalized[1] + normalized[1], 16),
      parseInt(normalized[2] + normalized[2], 16),
    ];
  }

  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function rgbToHex([r, g, b]: Rgb) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function buildMosaicPalette(baseColor = "#2A2424") {
  const base = parseHex(baseColor);
  const light = mixRgb(base, [255, 255, 255], 0.18);
  const dark = mixRgb(base, [0, 0, 0], 0.28);

  return Array.from({ length: 9 }, (_, index) => {
    const amount = index / 8;
    return rgbToHex(mixRgb(dark, light, amount));
  });
}

export function buildTriStyle(shades: string[]) {
  return `
    .tri{stroke:rgba(255,255,255,0.12);stroke-width:1.2;transition:fill 180ms ease}
    .tri:hover{fill:rgba(255,255,255,0.28)}
    ${shades.map((fill, index) => `.tri-${index}{fill:${fill}}`).join("\n")}
  `;
}
