import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "whitelist",
	title: "Whitelist",
	description:
		"A list of trusted addresses or domains allowed to bypass spam filters.",
	keywords: ["email whitelist", "allowlist email"],
	body: "Corporate allowlists help internal tools reach employee inboxes. Authentication (SPF/DKIM/DMARC) is the modern equivalent for external senders.",
};
