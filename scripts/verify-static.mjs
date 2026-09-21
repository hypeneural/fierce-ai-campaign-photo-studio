import { access, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const required = ["index.html", "health.json", "_next", "templates"];
const forbiddenNames = new Set([".git", "node_modules", "src", ".env", ".env.local"]);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

for (const item of required) {
  const target = path.join(root, item);
  if (!(await exists(target))) {
    throw new Error(`Static artifact missing required path: out/${item}`);
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (forbiddenNames.has(entry.name) || entry.name.endsWith(".pem") || entry.name.endsWith(".key")) {
      throw new Error(`Forbidden deployment artifact entry: ${path.relative(root, path.join(dir, entry.name))}`);
    }
    if (entry.isDirectory()) await walk(path.join(dir, entry.name));
  }
}

await walk(root);
console.log("Static artifact verification passed.");
