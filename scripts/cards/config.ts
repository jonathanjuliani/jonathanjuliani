export const config = {
  topN: 5,
  excludedLanguages: ["HTML", "CSS", "Dockerfile", "Makefile"] as readonly string[],
  otherColor: "#8b949e",
  barColor: "#3fb950",
  canvas: { width: 412, height: 200 },
} as const;
