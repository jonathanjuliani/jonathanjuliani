import { config } from "./config.ts";
import type { CardsResponse, ContributionDay } from "./github.ts";

export type ActivityModel = {
  contributions: number;
  pullRequests: number;
  reviews: number;
  buckets: number[];
};

export type LanguageItem = {
  name: string;
  color: string;
  percent: number;
  bytes: number;
};

export type LanguagesModel = {
  items: LanguageItem[];
};

export function buildActivity(data: CardsResponse): ActivityModel {
  const collection = data.user!.contributionsCollection;
  const days = flattenDays(collection.contributionCalendar.weeks);
  days.sort((a, b) => a.date.localeCompare(b.date));
  const window = days.slice(-364);
  const buckets = bucketDays(window, 26, 14);

  return {
    contributions: collection.contributionCalendar.totalContributions,
    pullRequests: collection.totalPullRequestContributions,
    reviews: collection.totalPullRequestReviewContributions,
    buckets,
  };
}

export function buildLanguages(
  data: CardsResponse,
  excluded: readonly string[] = config.excludedLanguages,
  topN: number = config.topN,
): LanguagesModel {
  const totals = new Map<string, { bytes: number; color: string }>();

  for (const repo of data.user!.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      if (excluded.includes(name)) continue;
      const color = edge.node.color ?? config.otherColor;
      const prev = totals.get(name);
      if (prev) {
        prev.bytes += edge.size;
      } else {
        totals.set(name, { bytes: edge.size, color });
      }
    }
  }

  const ranked = [...totals.entries()]
    .map(([name, v]) => ({ name, bytes: v.bytes, color: v.color }))
    .sort((a, b) => b.bytes - a.bytes);

  const top = ranked.slice(0, topN);
  const rest = ranked.slice(topN);
  const otherBytes = rest.reduce((sum, r) => sum + r.bytes, 0);

  const candidates =
    otherBytes > 0
      ? [...top, { name: "Other", bytes: otherBytes, color: config.otherColor }]
      : top;

  const totalBytes = candidates.reduce((sum, c) => sum + c.bytes, 0);
  if (totalBytes === 0) {
    return { items: [] };
  }

  const withPercents = largestRemainderPercents(candidates);
  const nonzero = withPercents.filter((item) => item.percent > 0);
  const zeroBytes = withPercents
    .filter((item) => item.percent === 0)
    .reduce((sum, item) => sum + item.bytes, 0);

  if (zeroBytes === 0) {
    return { items: nonzero };
  }

  const other = nonzero.find((item) => item.name === "Other");
  if (other) {
    other.bytes += zeroBytes;
  } else {
    nonzero.push({
      name: "Other",
      color: config.otherColor,
      bytes: zeroBytes,
      percent: 0,
    });
  }

  return { items: largestRemainderPercents(nonzero) };
}

function flattenDays(
  weeks: { contributionDays: ContributionDay[] }[],
): ContributionDay[] {
  return weeks.flatMap((w) => w.contributionDays);
}

function bucketDays(days: ContributionDay[], count: number, size: number): number[] {
  const buckets = Array.from({ length: count }, () => 0);
  for (let i = 0; i < count; i++) {
    const start = i * size;
    const chunk = days.slice(start, start + size);
    buckets[i] = chunk.reduce((sum, d) => sum + d.contributionCount, 0);
  }
  return buckets;
}

function largestRemainderPercents<T extends { name: string; color: string; bytes: number }>(
  items: T[],
): LanguageItem[] {
  const total = items.reduce((sum, item) => sum + item.bytes, 0);
  if (total === 0) {
    return items.map((item) => ({ ...item, percent: 0 }));
  }

  const exact = items.map((item) => ({
    ...item,
    raw: (item.bytes / total) * 100,
  }));
  const floored = exact.map((item) => ({
    ...item,
    percent: Math.floor(item.raw),
    frac: item.raw - Math.floor(item.raw),
  }));
  let remaining = 100 - floored.reduce((sum, item) => sum + item.percent, 0);
  floored
    .slice()
    .sort((a, b) => b.frac - a.frac)
    .forEach((item) => {
      if (remaining <= 0) return;
      const target = floored.find((f) => f.name === item.name && f.bytes === item.bytes)!;
      target.percent += 1;
      remaining -= 1;
    });

  return floored.map(({ name, color, bytes, percent }) => ({ name, color, bytes, percent }));
}
