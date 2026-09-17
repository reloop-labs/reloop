import type { EmailLogTag, EmailSendSource } from "./schema/email";

export type { EmailLogTag, EmailSendSource };

const SOURCES = new Set<EmailSendSource>([
	"transactional",
	"campaign",
	"automation",
	"smtp",
]);

export function isEmailSendSource(value: unknown): value is EmailSendSource {
	return typeof value === "string" && SOURCES.has(value as EmailSendSource);
}

export function sourceFromTags(tags?: EmailLogTag[] | null): EmailSendSource {
	for (const tag of tags ?? []) {
		const name = tag.name.toLowerCase();
		if (name === "campaign") return "campaign";
		if (name === "automation") return "automation";
	}
	return "transactional";
}

export function tagValue(
	tags: EmailLogTag[] | null | undefined,
	name: string,
): string | undefined {
	const needle = name.toLowerCase();
	return tags?.find((tag) => tag.name.toLowerCase() === needle)?.value;
}
