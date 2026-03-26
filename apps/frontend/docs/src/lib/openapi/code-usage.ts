import { createCodeUsageGeneratorRegistry } from "fumadocs-openapi/requests/generators";
import { registerDefault } from "fumadocs-openapi/requests/generators/all";

export const codeUsages = createCodeUsageGeneratorRegistry();
registerDefault(codeUsages);

