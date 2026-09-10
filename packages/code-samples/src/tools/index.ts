import type { CodeSample } from "../types";

import { checkTempEmailXCodeSamples } from "./temp-email-checker/temp-email-checker";

export { checkTempEmailXCodeSamples };

export const toolsSamples = {
	checkTempEmail: checkTempEmailXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type ToolsSampleKey = keyof typeof toolsSamples;
