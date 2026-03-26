import { openapi } from "@reloop/fe-docs/lib/openapi";
import { generateFiles } from "fumadocs-openapi";

void generateFiles({
  input: openapi,
  output: "./content/docs/api",
  includeDescription: true,
});
