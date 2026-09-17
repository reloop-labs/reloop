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
	icon: string;
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
			label:
				origin?.type === "campaign" && origin.name.trim()
					? origin.name
					: "Campaign",
			icon: "mega-phone",
			href: origin?.type === "campaign" ? `/campaigns/${origin.id}` : undefined,
		};
	}

	if (source === "automation") {
		return {
			label:
				origin?.type === "automation" && origin.name.trim()
					? origin.name
					: "Automation",
			icon: "workflow",
			href:
				origin?.type === "automation" ? `/automation/${origin.id}` : undefined,
		};
	}

	if (source === "smtp") {
		return { label: "Transactional", icon: "mail-send" };
	}

	return { label: "Transactional", icon: "code" };
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
