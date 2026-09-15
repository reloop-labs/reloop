export type EmailSendSource =
	| "transactional"
	| "campaign"
	| "automation"
	| "smtp";

export type EmailSendOrigin = {
	type: "campaign" | "automation";
	id: string;
	name: string;
};

export type EmailSendVia = {
	label: string;
	channel?: string;
	href?: string;
};

export function emailSendVia(params: {
	source?: string | null;
	origin?: EmailSendOrigin | null;
}): EmailSendVia {
	const source = params.source ?? "transactional";
	const origin = params.origin;

	if (source === "campaign") {
		return {
			label: "Campaign",
			channel: origin?.type === "campaign" ? origin.name : undefined,
			href: origin?.type === "campaign" ? `/campaigns/${origin.id}` : undefined,
		};
	}

	if (source === "automation") {
		return {
			label: "Automation",
			channel: origin?.type === "automation" ? origin.name : undefined,
			href:
				origin?.type === "automation" ? `/automation/${origin.id}` : undefined,
		};
	}

	if (source === "smtp") {
		return { label: "Transactional", channel: "SMTP" };
	}

	return { label: "Transactional", channel: "API" };
}

export function emailSendViaListLabel(source?: string | null): string {
	switch (source) {
		case "campaign":
			return "Campaign";
		case "automation":
			return "Automation";
		case "smtp":
			return "SMTP";
		default:
			return "Transactional";
	}
}
