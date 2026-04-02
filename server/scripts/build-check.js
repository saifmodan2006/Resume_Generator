import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      return collectFiles(fullPath);
    }

    return fullPath.endsWith(".js") ? [fullPath] : [];
  });
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "..", "src");
const files = collectFiles(srcDir);

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Validated ${files.length} server files.`);
