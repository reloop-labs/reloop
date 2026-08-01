export interface EmailEvent {
	id: string;
	type: string;
	metadata: Record<string, unknown> | Record<string, string> | null;
	createdAt: string;
}

/** SMTP response payload stored on Kumo-sourced email_event.metadata */
export type SmtpResponseMeta = {
	code?: number | null;
	content?: string | null;
	enhancedCode?: {
		class?: number;
		subject?: number;
		detail?: number;
	} | null;
	command?: string | null;
};

export function getSmtpResponseFromEvent(
	event: EmailEvent | undefined,
): SmtpResponseMeta | null {
	if (!event?.metadata || typeof event.metadata !== "object") return null;
	const response = (event.metadata as { response?: SmtpResponseMeta }).response;
	if (!response || typeof response !== "object") return null;
	return response;
}

export interface Step {
	type: string;
	label: string;
	icon: string;
}

export interface TimelineStepProps {
	label: string;
	icon: string;
	isCompleted: boolean;
	isLast: boolean;
	isNextToComplete: boolean;
	timestamp?: string;
}
