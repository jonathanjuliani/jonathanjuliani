import { config } from "./config.ts";
import type { ActivityModel } from "./model.ts";
import { escape, formatNumber, sharedStyle } from "./svg.ts";

export function renderActivity(model: ActivityModel): string {
  const { width, height } = config.canvas;
  const contrib = formatNumber(model.contributions);
  const prs = formatNumber(model.pullRequests);
  const reviews = formatNumber(model.reviews);
  const max = Math.max(...model.buckets, 0);

  const bars = model.buckets
    .map((v, i) => {
      let h = max === 0 ? 0 : Math.round((v / max) * 52);
      if (v > 0 && h < 2) h = 2;
      const x = 24 + i * 14;
      const y = 166 - h;
      return `<rect class="bar" x="${x}" y="${y}" width="10" height="${h}" rx="2"/>`;
    })
    .join("");

  const desc = escape(
    `${contrib} contributions, ${prs} pull requests, ${reviews} reviews over the last 12 months.`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Activity</title>
  <desc id="desc">${desc}</desc>
  ${sharedStyle()}
  <rect class="frame" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10"/>
  <text class="t" x="24" y="34">Activity</text>
  <text class="m" x="388" y="34" text-anchor="end">last 12 months</text>
  <text class="n" x="24" y="72">${escape(contrib)}</text>
  <text class="k" x="24" y="90">contributions</text>
  <text class="n" x="154" y="72">${escape(prs)}</text>
  <text class="k" x="154" y="90">pull requests</text>
  <text class="n" x="272" y="72">${escape(reviews)}</text>
  <text class="k" x="272" y="90">reviews</text>
  <line class="base" x1="24" y1="166.5" x2="388" y2="166.5"/>
  ${bars}
  <text class="f" x="24" y="186">includes private work · counts only</text>
</svg>
`;
}
