#!/usr/bin/env node
// Syncs .claude-plugin/plugin.json to package.json's version, keeping the fork's
// -imecoulter.<N> suffix (rule: DEVIATIONS.md). Writes -imecoulter.1 if absent.
// Runs as part of `npm run version`, immediately after `changeset version`.
// With --check it changes nothing and exits 1 unless the plugin version is
// <package.json version>-imecoulter.<N>.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = join(repo, ".claude-plugin", "plugin.json");

const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const source = readFileSync(pluginPath, "utf8");
const plugin = JSON.parse(source);

const [, base, suffix] = plugin.version.match(/^(.*?)(-imecoulter\.[1-9]\d*)?$/);
const expected = `${version}-imecoulter.<N>`;

if (process.argv.includes("--check")) {
  if (base === version && suffix) {
    console.log(`plugin.json version ${plugin.version} matches ${expected}`);
    process.exit(0);
  }
  console.error(
    `plugin.json version is ${plugin.version}, package.json is ${version}. Expected ${expected} (N a positive integer). Run \`node scripts/sync-plugin-version.mjs\`.`,
  );
  process.exit(1);
}

const target = `${version}${suffix ?? "-imecoulter.1"}`;

if (plugin.version === target) {
  console.log(`plugin.json version is ${target} — already in sync`);
  process.exit(0);
}

// Rewrite only the version line, to keep the key order and the formatting.
const updated = source.replace(
  /("version"\s*:\s*")[^"]*(")/,
  `$1${target}$2`,
);

if (JSON.parse(updated).version !== target) {
  console.error(`Could not find a version field to replace in ${pluginPath}.`);
  process.exit(1);
}

writeFileSync(pluginPath, updated);
console.log(`plugin.json version ${plugin.version} -> ${target}`);
