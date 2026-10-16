import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchCards } from "./github.ts";
import { buildActivity, buildLanguages } from "./model.ts";
import { renderActivity } from "./render-activity.ts";
import { renderLanguages } from "./render-languages.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const assetsDir = path.join(root, "assets");

async function main(): Promise<void> {
  const login = process.env.GH_LOGIN;
  const token = process.env.GH_TOKEN;

  if (!login || !token) {
    console.error("Missing GH_LOGIN or GH_TOKEN");
    process.exit(1);
  }

  const data = await fetchCards(login, token);
  const activity = buildActivity(data);
  const languages = buildLanguages(data);
  const activitySvg = renderActivity(activity);
  const languagesSvg = renderLanguages(languages);

  await mkdir(assetsDir, { recursive: true });
  await atomicWrite(path.join(assetsDir, "activity.svg"), activitySvg);
  await atomicWrite(path.join(assetsDir, "languages.svg"), languagesSvg);

  console.log(
    `activity: ${activity.contributions} contributions, ${activity.pullRequests} PRs, ${activity.reviews} reviews`,
  );
  console.log(
    `languages: ${languages.items.map((i) => `${i.name} ${i.percent}%`).join(", ") || "(none)"}`,
  );
}

async function atomicWrite(filePath: string, contents: string): Promise<void> {
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, contents, "utf8");
  await rename(tmp, filePath);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
