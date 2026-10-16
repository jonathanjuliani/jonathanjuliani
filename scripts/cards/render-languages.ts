import { config } from "./config.ts";
import type { LanguagesModel } from "./model.ts";
import { escape, sharedStyle, truncateLabel } from "./svg.ts";

export function renderLanguages(model: LanguagesModel): string {
  const { width, height } = config.canvas;
  const items = model.items.slice(0, 6);
  const trackX = 24;
  const trackW = 364;
  const endX = 388;

  let x = trackX;
  const segments = items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      const w = isLast
        ? endX - x
        : Math.max(0, Math.round((item.percent / 100) * trackW));
      const rect = `<rect x="${x}" y="50" width="${w}" height="10" fill="${escape(item.color)}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const rows = [92, 118, 144];
  const legend = items
    .map((item, i) => {
      const col = i < 3 ? 0 : 1;
      const row = rows[i % 3]!;
      const left = col === 0;
      const cx = left ? 30 : 222;
      const labelX = left ? 42 : 234;
      const percentX = left ? 190 : 388;
      const cy = row - 4;
      const label = escape(truncateLabel(item.name));
      const percent = escape(`${item.percent}%`);
      return `<circle cx="${cx}" cy="${cy}" r="4" fill="${escape(item.color)}"/>
  <text class="l" x="${labelX}" y="${row}">${label}</text>
  <text class="p" x="${percentX}" y="${row}" text-anchor="end">${percent}</text>`;
    })
    .join("\n  ");

  const summary = items.map((i) => `${i.name} ${i.percent}%`).join(", ");
  const desc = escape(
    summary
      ? `Language bytes across public personal repos: ${summary}.`
      : "No language data for public personal repos.",
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Languages</title>
  <desc id="desc">${desc}</desc>
  ${sharedStyle()}
  <rect class="frame" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10"/>
  <text class="t" x="24" y="34">Languages</text>
  <text class="m" x="388" y="34" text-anchor="end">last 12 months</text>
  <defs>
    <clipPath id="barClip">
      <rect x="24" y="50" width="364" height="10" rx="5"/>
    </clipPath>
  </defs>
  <g clip-path="url(#barClip)">
    ${segments}
  </g>
  ${legend}
  <text class="f" x="24" y="180">public personal repos · bytes of code</text>
</svg>
`;
}
