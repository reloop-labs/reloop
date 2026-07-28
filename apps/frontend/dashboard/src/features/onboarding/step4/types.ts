export type LanguageCode = "nodejs" | "go" | "php" | "python";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
/** Selected SDK language in the onboarding playground. */
export type IntegrationChoice = LanguageCode;
/** @deprecated Mode tabs removed; kept for unused integration-mode-tabs. */
export type IntegrationMode = "ai" | "manual";
