import { openapi } from "@reloop/fe-docs/lib/openapi";
import * as fs from "fs";
import { generateFiles } from "fumadocs-openapi";
import * as path from "path";

const targetDir = "./content/docs/api";

// Clean up previously generated files
if (fs.existsSync(targetDir)) {
  const files = fs.readdirSync(targetDir);
  const manualFiles = [
    "index.mdx",
    "pagination.mdx",
    "usage-limits.mdx",
    "errors.mdx",
  ];
  for (const file of files) {
    if (file.endsWith(".mdx") && !manualFiles.includes(file)) {
      fs.unlinkSync(path.join(targetDir, file));
    }
  }
}

void generateFiles({
  input: openapi,
  output: targetDir,
  includeDescription: true,
});
