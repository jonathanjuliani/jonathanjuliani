import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { CardsResponse } from "./github.ts";
import { buildActivity, buildLanguages } from "./model.ts";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__/user.json",
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as CardsResponse;

describe("buildActivity", () => {
  it("returns 26 buckets whose sum matches the last 364 days", () => {
    const model = buildActivity(fixture);
    expect(model.buckets).toHaveLength(26);

    const days = fixture
      .user!.contributionsCollection.contributionCalendar.weeks.flatMap(
        (w) => w.contributionDays,
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-364);
    const windowTotal = days.reduce((sum, d) => sum + d.contributionCount, 0);
    expect(model.buckets.reduce((a, b) => a + b, 0)).toBe(windowTotal);
  });

  it("reads headline counts from the collection", () => {
    const model = buildActivity(fixture);
    const c = fixture.user!.contributionsCollection;
    expect(model.contributions).toBe(c.contributionCalendar.totalContributions);
    expect(model.pullRequests).toBe(c.totalPullRequestContributions);
    expect(model.reviews).toBe(c.totalPullRequestReviewContributions);
  });
});

describe("buildLanguages", () => {
  it("percents sum to exactly 100 when there is data", () => {
    const model = buildLanguages(fixture);
    if (model.items.length === 0) return;
    expect(model.items.reduce((sum, i) => sum + i.percent, 0)).toBe(100);
  });

  it("excludes configured languages", () => {
    const model = buildLanguages(fixture, ["HTML", "CSS", "Dockerfile", "Makefile", "Python"]);
    expect(model.items.every((i) => i.name !== "Python")).toBe(true);
  });

  it("falls back null color to #8b949e", () => {
    const data: CardsResponse = {
      user: {
        contributionsCollection: {
          totalPullRequestContributions: 0,
          totalPullRequestReviewContributions: 0,
          restrictedContributionsCount: 0,
          contributionCalendar: { totalContributions: 0, weeks: [] },
        },
        repositories: {
          nodes: [
            {
              languages: {
                edges: [{ size: 100, node: { name: "Mystery", color: null } }],
              },
            },
          ],
        },
      },
    };
    const model = buildLanguages(data, [], 5);
    expect(model.items[0]?.color).toBe("#8b949e");
  });
});
