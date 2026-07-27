import type { CodeSample } from "../types";

import { sendEmailXCodeSamples } from "./send-email/send-email";

export { sendEmailXCodeSamples };

export const mailSamples = {
	sendEmail: sendEmailXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type MailSampleKey = keyof typeof mailSamples;
