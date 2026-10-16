export function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function truncateLabel(label: string, max = 14): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

/** Shared light/dark theme for activity and languages cards. */
export function sharedStyle(): string {
  return `<style>
    .frame { fill: #ffffff; stroke: #d0d7de; stroke-width: 1; }
    .t { fill: #1f2328; font: 600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .m { fill: #656d76; font: 400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .n { fill: #1f2328; font: 600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .k { fill: #656d76; font: 400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .f { fill: #656d76; font: 400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .l { fill: #1f2328; font: 400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .p { fill: #656d76; font: 400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .bar { fill: #3fb950; }
    .base { stroke: #d0d7de; stroke-width: 1; }
    @media (prefers-color-scheme: dark) {
      .frame { fill: #0d1117; stroke: #30363d; }
      .t { fill: #e6edf3; }
      .m { fill: #8b949e; }
      .n { fill: #e6edf3; }
      .k { fill: #8b949e; }
      .f { fill: #8b949e; }
      .l { fill: #e6edf3; }
      .p { fill: #8b949e; }
      .base { stroke: #30363d; }
    }
  </style>`;
}
