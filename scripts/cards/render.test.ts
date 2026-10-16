import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DOMParser } from "@xmldom/xmldom";
import { describe, expect, it } from "vitest";
import type { CardsResponse } from "./github.ts";
import { buildActivity, buildLanguages, type ActivityModel, type LanguagesModel } from "./model.ts";
import { renderActivity } from "./render-activity.ts";
import { renderLanguages } from "./render-languages.ts";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__/user.json",
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as CardsResponse;

function parseSvg(svg: string): Document {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  if (!root || root.nodeName !== "svg") {
    throw new Error("SVG root missing");
  }
  return doc;
}

describe("renderActivity", () => {
  it("parses as XML and snapshots from the fixture", () => {
    const svg = renderActivity(buildActivity(fixture));
    expect(() => parseSvg(svg)).not.toThrow();
    expect(svg).toMatchSnapshot();
  });

  it("renders a zero-contribution year without NaN", () => {
    const model: ActivityModel = {
      contributions: 0,
      pullRequests: 0,
      reviews: 0,
      buckets: Array.from({ length: 26 }, () => 0),
    };
    const svg = renderActivity(model);
    expect(svg).not.toMatch(/NaN/);
    expect(svg).toContain(">0</text>");
  });
});

describe("renderLanguages", () => {
  it("parses as XML and snapshots from the fixture", () => {
    const svg = renderLanguages(buildLanguages(fixture));
    expect(() => parseSvg(svg)).not.toThrow();
    expect(svg).toMatchSnapshot();
  });

  it("escapes dangerous language names", () => {
    const model: LanguagesModel = {
      items: [
        { name: "<script>&", color: "#fff", percent: 100, bytes: 10 },
      ],
    };
    const svg = renderLanguages(model);
    expect(svg).toContain("&lt;script&gt;&amp;");
    expect(svg).not.toContain("<script>&");
  });
});
