export type CampaignSkipReason =
	| "unsubscribed"
	| "blocked"
	| "suppressed"
	| "duplicate"
	| "cancelled";

export type SendableContact = {
	status: string;
	suppressionReason?: string | null;
	deletedAt?: Date | null;
};

export function skipReasonForContact(
	contact: SendableContact,
): Exclude<CampaignSkipReason, "duplicate" | "cancelled"> | null {
	if (contact.deletedAt) return "unsubscribed";
	if (contact.status === "unsubscribed") return "unsubscribed";
	if (contact.status === "blocked") return "blocked";
	if (contact.suppressionReason) return "suppressed";
	if (contact.status !== "subscribed") return "unsubscribed";
	return null;
}

export function normalizeCsvEmails(emails: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const raw of emails) {
		const email = raw.trim().toLowerCase();
		if (!email || !email.includes("@")) continue;
		if (seen.has(email)) continue;
		seen.add(email);
		out.push(email);
	}
	return out;
}

export function htmlToText(html: string): string {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/\s+/g, " ")
		.trim();
}
