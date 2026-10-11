import * as z from "zod";
import { resourceIdSchema } from "../contacts/schemas";
import { defineTool } from "../define";

const countsShape = {
	sent: z.number(),
	delivered: z.number(),
	opened: z.number(),
	bounced: z.number(),
	complaints: z.number(),
	unsubscribed: z.number(),
};

function sum(values: number[] | undefined): number {
	return (values ?? []).reduce((total, value) => total + value, 0);
}

export const getEmailStats = defineTool({
	name: "get_email_stats",
	title: "Get email stats",
	description:
		"Get sending statistics for the organization over a time window: totals plus a per-day (or per-hour) series of sent, delivered, opened, bounced, complaint, and unsubscribe counts, with the delivery rate. Optionally limit to one sending domain by ID (from list_domains). Use this to judge deliverability or spot a bounce spike; use list_emails to inspect individual emails.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		since: z.iso
			.datetime({ offset: true })
			.optional()
			.describe("Start of the window as an ISO 8601 timestamp"),
		until: z.iso
			.datetime({ offset: true })
			.optional()
			.describe("End of the window as an ISO 8601 timestamp"),
		interval: z
			.enum(["day", "hour"])
			.default("day")
			.describe("Bucket size of the series"),
		domainId: resourceIdSchema
			.optional()
			.describe("Only count emails sent from this domain ID"),
	}),
	output: z.object({
		totals: z.object({
			...countsShape,
			deliveryRate: z
				.number()
				.describe("Delivered as a percentage of sent, 0 to 100"),
		}),
		series: z.array(
			z.object({
				date: z.string(),
				...countsShape,
				deliveryRate: z.number(),
			}),
		),
	}),
	async run(args, api) {
		const stats = await api.emailLogs.stats({
			start_date: args.since,
			end_date: args.until,
			interval: args.interval,
			domain_id: args.domainId,
		});
		const sent = sum(stats.sent);
		const delivered = sum(stats.delivered);
		return {
			totals: {
				sent,
				delivered,
				opened: sum(stats.opened),
				bounced: sum(stats.bounced),
				complaints: sum(stats.complaint),
				unsubscribed: sum(stats.unsubscribed),
				deliveryRate:
					sent > 0 ? Math.round((delivered / sent) * 10000) / 100 : 0,
			},
			series: stats.dates.map((date, index) => ({
				date,
				sent: stats.sent[index] ?? 0,
				delivered: stats.delivered[index] ?? 0,
				opened: stats.opened[index] ?? 0,
				bounced: stats.bounced[index] ?? 0,
				complaints: stats.complaint[index] ?? 0,
				unsubscribed: stats.unsubscribed?.[index] ?? 0,
				deliveryRate: stats.rate[index] ?? 0,
			})),
		};
	},
});
