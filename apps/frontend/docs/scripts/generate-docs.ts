import { services } from "@reloop/fe-docs/lib/openapi";
import * as fs from "fs";
import { generateFiles } from "fumadocs-openapi";
import * as path from "path";

const targetDir = "./content/docs/api";

// Clean up previously generated files
if (fs.existsSync(targetDir)) {
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const manualFiles = [
    "index.mdx",
    "pagination.mdx",
    "usage-limits.mdx",
    "errors.mdx",
    "meta.json"
  ];
  for (const entry of entries) {
    if (manualFiles.includes(entry.name)) continue;
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

for (const [name, openapi] of Object.entries(services)) {
  const outputDir = path.join(targetDir, name);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  void generateFiles({
    input: openapi,
    output: outputDir,
    includeDescription: true,
  });
}
