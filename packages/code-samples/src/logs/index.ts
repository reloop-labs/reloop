import type { CodeSample } from "../types";

import { getLogXCodeSamples } from "./get-log/get-log";
import { listLogsXCodeSamples } from "./list-logs/list-logs";

export { getLogXCodeSamples };
export { listLogsXCodeSamples };

export const logsSamples = {
	getLog: getLogXCodeSamples,
	listLogs: listLogsXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type LogsSampleKey = keyof typeof logsSamples;
