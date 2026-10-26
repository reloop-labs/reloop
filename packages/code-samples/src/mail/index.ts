import type { CodeSample } from "../types";

import { sendBatchXCodeSamples } from "./send-batch/send-batch";
import { sendEmailXCodeSamples } from "./send-email/send-email";

export { sendBatchXCodeSamples, sendEmailXCodeSamples };

export const mailSamples = {
	sendEmail: sendEmailXCodeSamples,
	sendBatch: sendBatchXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type MailSampleKey = keyof typeof mailSamples;
