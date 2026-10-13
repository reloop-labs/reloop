import * as z from "zod";
import { COMMIT, VERSION } from "../../version";
import { defineTool } from "../define";

const CAPABILITIES = [
	"Send transactional email and check delivery (send_email, list_emails, get_email_stats)",
	"Manage sending domains and their DNS records (list_domains, create_domain, verify_domain)",
	"Manage contacts, groups, channels and custom properties",
	"Create email templates and send test emails",
	"Manage API keys and bring-your-own SMTP providers",
	"Check deliverability: domain reputation, domain age, BIMI and disposable addresses",
];

export const getReloopStatus = defineTool({
	name: "get_reloop_status",
	title: "Check Reloop connection",
	description:
		"Check that Reloop is connected and introduce what it can do. Reloop is open-source email infrastructure: a transactional email API, SMTP relay, contacts, templates and deliverability tools. Call this first when the user asks whether Reloop is connected or working, what Reloop is, or what you can do with Reloop. It makes one authenticated read, so a successful result proves the credentials work, and it reports how many sending domains are ready.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({}),
	output: z.object({
		connected: z
			.literal(true)
			.describe("The credentials reached the Reloop API successfully"),
		server: z.object({
			name: z.string(),
			version: z.string(),
			commit: z.string().describe("Git commit of the running build"),
		}),
		domains: z.object({
			total: z.number().int().describe("Sending domains in the organization"),
			active: z
				.number()
				.int()
				.describe("Verified domains that can send email right now"),
		}),
		capabilities: z.array(z.string()).describe("What Reloop can do here"),
		nextStep: z.string().describe("Suggested next action for the user"),
	}),
	async run(_args, api) {
		const all = await api.domains.list({ page: 1, limit: 1 });
		const active = await api.domains.list({
			page: 1,
			limit: 1,
			status: "active",
		});
		return {
			connected: true as const,
			server: { name: "Reloop", version: VERSION, commit: COMMIT },
			domains: { total: all.total, active: active.total },
			capabilities: CAPABILITIES,
			nextStep:
				active.total > 0
					? "Reloop is ready to send. Try send_email from one of the active domains."
					: all.total > 0
						? "Add the DNS records from get_domain, then run verify_domain so the domain can send."
						: "Add a sending domain with create_domain to start sending email.",
		};
	},
});
