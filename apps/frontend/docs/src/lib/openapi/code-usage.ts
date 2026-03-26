import { createCodeUsageGeneratorRegistry } from "fumadocs-openapi/requests/generators";

// Empty registry — only x-codeSamples from the OpenAPI spec will be shown
export const codeUsages = createCodeUsageGeneratorRegistry();
