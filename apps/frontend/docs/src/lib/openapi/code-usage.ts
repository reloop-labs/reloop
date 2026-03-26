import {
  type CodeUsageGenerator,
  createCodeUsageGeneratorRegistry,
} from "fumadocs-openapi/requests/generators";
import { registerDefault } from "fumadocs-openapi/requests/generators/all";

export const codeUsages = createCodeUsageGeneratorRegistry();

// include defaults
registerDefault(codeUsages);

// add custom generators
codeUsages.add("custom-id", {
  label: "My Example",
  lang: "js",
  generate(url, data, { mediaAdapters }) {
    // request data
    console.log(url, data);

    return 'const response = "hello world";';
  },
});
