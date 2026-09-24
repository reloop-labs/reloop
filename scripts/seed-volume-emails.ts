import { createId } from "@paralleldrive/cuid2";
import { db } from "../packages/db/src/client.js";
import {
	emailLog,
	emailEvent,
	type EmailLogTag,
} from "../packages/db/src/schema/email.js";
import {
	emailSend,
	organizationCredits,
	organizationPlan,
} from "../packages/db/src/schema/billing.js";
import { eq, notInArray, inArray } from "drizzle-orm";

const ORG_ID = "iFqWuHdDnZTRpFJZR2K9GCCUM0SUY9cO";
const DOMAIN_ID = "domain_ty715n44y3e1s21hy71wzkaf";
const USER_ID = "gnh2huMk8KRDj7DITanAN03tvhkSHOxY";
const API_KEY_ID = "api_key_m01dtsklt4w0xzaql5nixdxg";
const CREDITS_ID = "ocr_s09x6qcilogsi3zf8ysk3cab";
const SENDER_DOMAIN = "local.reloop.sh";

// Keep the 16 showcased demo emails intact
const PRIMARY_IDS = [
	"eml_f7y5zc4bgxxvmn1jiw4oyx4k",
	"eml_vr4tpw1y1wjgf5c9207jvedg",
	"eml_cpazbea5i1992eo2wbmiwbmh",
	"eml_ghzgl0aaiei97ewut91gnusx",
	"eml_p43pqqdrxwo7bu02rffyh5jv",
	"eml_izpqb782mdchtrfs7tx06te3",
	"eml_ww0arybhme6t52pxv6met5ar",
	"eml_yun1sdjheaj9nf1umbilfyqy",
	"eml_woktueofr7x4pp4ziir565y0",
	"eml_u4bqp5rkswixklju6htxe1c3",
	"eml_y14iiwt82av5ufbxofvgm7uf",
	"eml_ng1s13ohf7avdosznhm2ga96",
	"eml_mp1jpk42in27czwg27ucdfjs",
	"eml_ci0smtvh0s1segsoha0y1w5p",
	"eml_psnw01th25yfcbmha1jll8y0",
	"eml_v0mjiy0iitfdxos2ildq9cj3",
];

interface BrandDef {
	name: string;
	fromEmail: string;
	tags: EmailLogTag[];
	subjects: string[];
}

const BRANDS: BrandDef[] = [
	{
		name: "Linear",
		fromEmail: `notifications@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "notifications" },
			{ name: "service", value: "linear" },
		],
		subjects: [
			'[Linear] Assigned: "Reduce P99 API latency below 45ms" (LIN-1240)',
			'[Linear] Karri mentioned you in LIN-892: "Refactor webhook retry queues"',
			"[Linear] New cycle starting: Sprint 48 (Cycle Goal: Zero P0 bugs)",
			"[Linear] Release completed: Reloop Desktop 2.4.0",
			'[Linear] Project milestone reached: "Core Transport v2"',
		],
	},
	{
		name: "Vercel Deployments",
		fromEmail: `deployments@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "ci-cd" },
			{ name: "service", value: "vercel" },
		],
		subjects: [
			"Production deployment ready: frontend-core (dpl_9a2f7c)",
			"Edge Middleware invoked: 1.2M requests in past 24 hours",
			'Build cache hit rate reached 94.2% on project "web-portal"',
			"Instant rollback executed to deployment dpl_7b19a0",
			"Preview deployment available for pull request #512",
		],
	},
	{
		name: "OpenAI Platform",
		fromEmail: `platform@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "billing" },
			{ name: "service", value: "openai" },
		],
		subjects: [
			"Monthly API Usage Statement — August 2026 ($1,840.50)",
			"Rate limit tier upgrade approved: Tier 5 (Enterprise)",
			"New model availability: gpt-4o-2026-08-06 now enabled",
			"Usage threshold alert: 80% of monthly soft limit reached",
			"Organization API key rotated by administrator",
		],
	},
	{
		name: "Supabase Cloud",
		fromEmail: `team@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "infrastructure" },
			{ name: "service", value: "supabase" },
		],
		subjects: [
			"Database cluster snapshot completed: pg-cluster-prod-us-east-1",
			"Connection pooler pgbouncer adjusted: max_client_conn=5000",
			"Point-in-time recovery WAL archive verified successfully",
			"SSL certificate renewed for db.production-cluster-01",
			"Read replica replication lag recovered to 0ms",
		],
	},
	{
		name: "Figma Team",
		fromEmail: `notifications@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "design" },
			{ name: "service", value: "figma" },
		],
		subjects: [
			'Rasmus Andersson commented on "Reloop Design System v2"',
			"Library update published: 34 components updated by Dylan",
			"New branch merged: feature/fluid-motion-tokens into Main",
			'You were invited to edit file: "Mobile App Wireframes v3"',
			"Design review scheduled: Dark mode contrast audit",
		],
	},
	{
		name: "Shopify Orders",
		fromEmail: `orders@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "ecommerce" },
			{ name: "service", value: "shopify" },
		],
		subjects: [
			"New order #SH-9042 received: Framework 16 Laptop ($2,199.00)",
			"Payout of $14,290.50 USD is scheduled for transfer",
			"Daily merchant analytics: 1,480 orders processed",
			"Inventory alert: Framework 16 Keyboard Module low stock",
			"Fulfillment confirmed for order #SH-8910 (FedEx Express)",
		],
	},
	{
		name: "GitHub Actions",
		fromEmail: `notifications@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "ci-cd" },
			{ name: "service", value: "github" },
		],
		subjects: [
			"[reloop-labs/reloop] Run passed: CI / End-to-End Suite (#482)",
			"[Security Advisory] Dependabot detected 0 open vulnerabilities",
			"Pull request #485 approved by code owners and ready for merge",
			"Release v2.4.0 published with 18 contributors",
			"Workflow run succeeded: Build and push multi-arch Docker image",
		],
	},
	{
		name: "Tailscale Admin",
		fromEmail: `notifications@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "network" },
			{ name: "service", value: "tailscale" },
		],
		subjects: [
			"New device node joined tailnet: macbook-pro-m3-pranav",
			"Tailscale Subnet Router online: us-east-vpc-exit-node",
			"Key expiry renewal reminder: 14 days remaining for node-worker-3",
			"Access control policy updated by network administrator",
			"MagicDNS routes reloaded successfully across all nodes",
		],
	},
	{
		name: "PostHog Insights",
		fromEmail: `analytics@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "analytics" },
			{ name: "service", value: "posthog" },
		],
		subjects: [
			"Weekly Product Digest: 142,500 active sessions (+18.4%)",
			"Feature flag rolled out to 50% of authenticated users",
			"New funnel insight: Signup to First API Key Send at 68.4%",
			"Experiment completed: Variant B increased conversion by 12.1%",
			"Session recording volume alert: 50,000 sessions captured today",
		],
	},
	{
		name: "Slack Team",
		fromEmail: `team@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "workspace" },
			{ name: "service", value: "slack" },
		],
		subjects: [
			"Welcome to your new enterprise workspace on Slack",
			"Weekly channel activity summary: 3,420 messages posted",
			"New canvas shared in #engineering-announcements",
			"Workflow automation executed: Daily standup reminder",
			"Channel created: #proj-cloud-migration-q4",
		],
	},
	{
		name: "Datadog Ops",
		fromEmail: `ops@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "monitoring" },
			{ name: "service", value: "datadog" },
		],
		subjects: [
			"[P1 Resolved] API Gateway p99 response time returned to normal",
			"SLO report: 99.98% uptime achieved across 12 services",
			"APM trace analysis: Average database roundtrip dropped to 2.4ms",
			"Weekly anomaly detection report: 0 unexpected traffic spikes",
			"Monitor recovered: Memory utilization on worker-cluster-4",
		],
	},
	{
		name: "Raycast",
		fromEmail: `store@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "extensions" },
			{ name: "service", value: "raycast" },
		],
		subjects: [
			'Extension published: "Reloop Email Dispatcher for Raycast"',
			"Your extension reached 5,000 active weekly installs",
			'New 5-star review received for "Reloop Quick Actions"',
			"Extension update 1.2.0 passed automated linting and security audit",
		],
	},
	{
		name: "Cloudflare",
		fromEmail: `workers@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "serverless" },
			{ name: "service", value: "cloudflare" },
		],
		subjects: [
			"Deployment successful: edge-email-router to 330+ locations",
			"DDoS defense: Mitigated 24,000 malicious requests from botnet",
			"Zone DNSSEC signed and active on domain local.reloop.sh",
			"Zero Trust Access policy enforced for developer staging endpoints",
		],
	},
	{
		name: "Airbnb Travel",
		fromEmail: `bookings@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "booking" },
			{ name: "service", value: "airbnb" },
		],
		subjects: [
			"Reservation confirmed: Minimalist Loft in Shibuya, Tokyo",
			"Receipt for your stay in San Francisco ($640.00 USD)",
			"Host Kenji updated check-in instructions for your reservation",
			"Your upcoming trip to Tokyo begins in 3 days",
		],
	},
	{
		name: "Uber Rides",
		fromEmail: `rides@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "receipt" },
			{ name: "service", value: "uber" },
		],
		subjects: [
			"Your Tuesday evening trip with Uber Black ($48.20 USD)",
			"Your Monday morning commute with Uber Green ($24.50 USD)",
			"Uber for Business: Monthly employee travel statement",
			"Receipt for trip from SFO Terminal 2 to Downtown SF",
		],
	},
	{
		name: "Notion Team",
		fromEmail: `workspace@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "digest" },
			{ name: "service", value: "notion" },
		],
		subjects: [
			"Workspace digest: 24 new documents added this week",
			'Page shared with you: "Engineering Architecture RFC 2026"',
			'Database lock enabled on "Q4 Product Roadmap & Releases"',
			'Ivan Zhao commented on "API Design Guidelines"',
		],
	},
	{
		name: "Prisma Data",
		fromEmail: `studio@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "database" },
			{ name: "service", value: "prisma" },
		],
		subjects: [
			"Schema migration 20260924_add_indexes applied successfully",
			"Prisma Accelerate cache hit rate reached 89.1%",
			"Database query optimization suggestion: Missing index on email_send",
		],
	},
	{
		name: "Resend Notifications",
		fromEmail: `updates@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "platform" },
			{ name: "service", value: "resend" },
		],
		subjects: [
			"DKIM keys verified for domain mail.customer-app.io",
			"Daily delivery summary: 12,400 transactional emails delivered",
			"Webhook endpoint health check: 100% success rate over 24h",
		],
	},
	{
		name: "Clerk Authentication",
		fromEmail: `auth@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "auth" },
			{ name: "service", value: "clerk" },
		],
		subjects: [
			"New user signed up: alex.rivers@stripe.com via Passkey",
			"SAML SSO connection established with Okta identity provider",
			"Security audit: Multi-factor authentication enabled on 100% of admin accounts",
		],
	},
	{
		name: "Mintlify",
		fromEmail: `docs@${SENDER_DOMAIN}`,
		tags: [
			{ name: "category", value: "documentation" },
			{ name: "service", value: "mintlify" },
		],
		subjects: [
			"Documentation deployment succeeded for docs.reloop.sh",
			"Interactive API playground requests up 42% this week",
			"Search analytics: Top query was 'send transactional email'",
		],
	},
];

const RECIPIENTS = [
	"karri.saarinen@linear.app",
	"guillermo.rauch@vercel.com",
	"sam.altman@openai.com",
	"paul.copplestone@supabase.io",
	"dylan.field@figma.com",
	"tobi.lutke@shopify.com",
	"nat.friedman@github.com",
	"avery.penn@tailscale.com",
	"james.hawkins@posthog.com",
	"stewart.butterfield@slack.com",
	"alexis.oncall@datadoghq.com",
	"thomas.paul@raycast.com",
	"matthew.prince@cloudflare.com",
	"brian.chesky@airbnb.com",
	"dara.khosrowshahi@uber.com",
	"ivan.zhao@makenotion.com",
	"soren.bramer@prisma.io",
	"zeno.rocha@resend.com",
	"gabriel.valdivia@railway.app",
	"colin.sidoti@clerk.dev",
	"han.wang@mintlify.com",
	"koen.bok@framer.com",
	"david.cramer@sentry.io",
	"mitchell.hashimoto@hashicorp.com",
	"sam.lambert@planetscale.com",
	"alex.rivers@acme-corp.io",
	"elena.rostova@hyperion-tech.com",
	"marcus.vance@apex-systems.dev",
	"sarah.chen@strata-labs.com",
	"devops-team@globex-corp.net",
	"billing-audit@initech-cloud.io",
	"sec-ops@vector-ai.org",
	"platform-lead@monolith-soft.com",
	"infra-alerts@aurora-cloud.io",
	"eng-leads@solaris-labs.dev",
	"reliability@quantum-flow.net",
	"dev-rel@prism-networks.io",
	"systems@nexus-digital.org",
	"operations@pulsar-ai.com",
	"core-eng@zenith-edge.tech",
];

function getRandomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
	console.log("🧹 Clearing flat dummy emails from previous seed...");
	// 1. Delete previous generated non-primary emails so we have clean slate
	await db.delete(emailSend).where(
		inArray(
			emailSend.emailLogId,
			db
				.select({ id: emailLog.id })
				.from(emailLog)
				.where(notInArray(emailLog.id, PRIMARY_IDS)),
		),
	);
	await db.delete(emailEvent).where(
		inArray(
			emailEvent.emailLogId,
			db
				.select({ id: emailLog.id })
				.from(emailLog)
				.where(notInArray(emailLog.id, PRIMARY_IDS)),
		),
	);
	await db.delete(emailLog).where(notInArray(emailLog.id, PRIMARY_IDS));
	console.log("   ✓ Cleaned previous filler emails");

	// 2. Compute organic daily weights over 30 days
	const now = new Date("2026-09-24T13:51:48Z");
	const DAYS = 30;
	const dailyWeights: { date: Date; count: number }[] = [];

	let totalWeight = 0;
	const weights: number[] = [];

	for (let i = DAYS - 1; i >= 0; i--) {
		const d = new Date(now);
		d.setUTCDate(d.getUTCDate() - i);
		const dayOfWeek = d.getUTCDay(); // 0 = Sun, 6 = Sat

		// Day-of-week seasonality (Mon-Thu high, Fri medium, Sat-Sun low)
		const dayMultiplier = [0.58, 1.15, 1.34, 1.28, 1.22, 0.95, 0.48][dayOfWeek];
		// Natural organic growth curve over the month
		const growthFactor = 0.75 + (0.60 * ((DAYS - 1 - i) / (DAYS - 1)));
		// Mid-month product release peak (Sep 14 - Sep 16)
		const spike = (i >= 8 && i <= 10) ? 1.25 : 1.0;
		// Micro-variance +/- 7% so line is never mechanically flat
		const noise = 1 + (Math.sin(i * 1.7) * 0.07);

		const weight = dayMultiplier * growthFactor * spike * noise;
		weights.push(weight);
		totalWeight += weight;
	}

	// Pick random total count between 12,800 and 14,200
	const TARGET_TOTAL = 12800 + Math.floor(Math.random() * 1400); // e.g. ~13,500
	let runningSum = 0;

	for (let i = 0; i < DAYS; i++) {
		const d = new Date(now);
		d.setUTCDate(d.getUTCDate() - (DAYS - 1 - i));
		const dayCount = Math.round((weights[i] / totalWeight) * TARGET_TOTAL);
		runningSum += dayCount;
		dailyWeights.push({ date: d, count: dayCount });
	}

	console.log(`\n📈 Generated realistic SaaS wave distribution:`);
	console.log(`   Target volume: ${runningSum.toLocaleString()} emails across 30 days`);

	// 3. Upgraded organization plan
	await db
		.update(organizationPlan)
		.set({
			planId: "enterprise",
			monthlyEmails: 100000,
			dailyEmailLimit: 50000,
		})
		.where(eq(organizationPlan.organizationId, ORG_ID));

	await db
		.update(organizationCredits)
		.set({
			monthlyCredits: 100000,
			creditsUsed: runningSum,
			creditsRemaining: 100000 - runningSum,
			dailyEmailsUsed: dailyWeights[dailyWeights.length - 1].count,
		})
		.where(eq(organizationCredits.organizationId, ORG_ID));

	console.log("   ✓ Enterprise plan & credits updated\n");

	// 4. Generate records day-by-day
	const BATCH_SIZE = 500;
	let currentBatchLogs: any[] = [];
	let currentBatchSends: any[] = [];
	let currentBatchEvents: any[] = [];
	let insertedSoFar = 0;

	// Total complaints across entire 30 days: 4 (spread across days 7, 14, 21, 28)
	const complaintDays = new Set([7, 14, 21, 28]);

	for (let dayIndex = 0; dayIndex < dailyWeights.length; dayIndex++) {
		const { date: baseDate, count: dayEmailCount } = dailyWeights[dayIndex];

		// For this day, determine bounce count (~0.8% - 1.2% with natural jitter)
		const dayBounceRate = 0.008 + (Math.sin(dayIndex * 2.1) * 0.0035); // 0.65% to 1.15%
		const dayBounces = Math.max(1, Math.round(dayEmailCount * dayBounceRate));
		const hasComplaint = complaintDays.has(dayIndex);
		const dayComplaints = hasComplaint ? 1 : 0;
		const dayDelivered = dayEmailCount - dayBounces - dayComplaints;

		// Build statuses for this day
		const dayStatuses: ("delivered" | "bounced" | "spam")[] = [];
		for (let k = 0; k < dayDelivered; k++) dayStatuses.push("delivered");
		for (let k = 0; k < dayBounces; k++) dayStatuses.push("bounced");
		for (let k = 0; k < dayComplaints; k++) dayStatuses.push("spam");

		// Shuffle day statuses
		for (let k = dayStatuses.length - 1; k > 0; k--) {
			const j = Math.floor(Math.random() * (k + 1));
			const temp = dayStatuses[k];
			dayStatuses[k] = dayStatuses[j];
			dayStatuses[j] = temp;
		}

		for (let k = 0; k < dayEmailCount; k++) {
			const status = dayStatuses[k];

			// Distribute time naturally through the day (higher probability between 08:00 and 20:00)
			const hour = Math.min(23, Math.max(0, Math.floor(
				Math.random() < 0.8
					? 8 + Math.random() * 12 // 8am - 8pm business hours (80%)
					: Math.random() * 24     // off-peak (20%)
			)));
			const minute = Math.floor(Math.random() * 60);
			const second = Math.floor(Math.random() * 60);

			const emailDate = new Date(baseDate);
			emailDate.setUTCHours(hour, minute, second, Math.floor(Math.random() * 900));

			// If it's today (dayIndex === 29), don't exceed current time
			if (dayIndex === DAYS - 1 && emailDate.getTime() > now.getTime()) {
				emailDate.setTime(now.getTime() - Math.floor(Math.random() * 8 * 60 * 60 * 1000));
			}

			const sentTime = new Date(emailDate.getTime() + 150);
			const deliveredTime = new Date(emailDate.getTime() + 450);

			const brand = getRandomItem(BRANDS);
			const recipient = getRandomItem(RECIPIENTS);
			const subject = getRandomItem(brand.subjects);

			const logId = `eml_${createId()}`;
			const sendId = `esn_${createId()}`;
			const messageId = `<${createId()}@${SENDER_DOMAIN}>`;

			let errorMessage: string | null = null;
			if (status === "bounced") {
				const isPermanent = Math.random() < 0.42;
				errorMessage = isPermanent
					? `KumoMTA PermanentFailure: 550 5.1.1 <${recipient}>: Recipient address rejected: User unknown in virtual mailbox table`
					: `KumoMTA TransientFailure: 452 4.2.2 <${recipient}>: Mailbox is full / quota exceeded`;
			} else if (status === "spam") {
				errorMessage = `Feedback loop: Abuse report received from mail service provider (ARF report)`;
			}

			currentBatchLogs.push({
				id: logId,
				messageId,
				organizationId: ORG_ID,
				domainId: DOMAIN_ID,
				userId: USER_ID,
				apikeyId: API_KEY_ID,
				fromEmail: brand.fromEmail,
				fromName: brand.name,
				toEmails: [recipient],
				subject,
				textBody: `${subject} - Sent via Reloop platform.`,
				htmlBody: `<div style="font-family: -apple-system, sans-serif; padding: 24px;"><h2>${brand.name}</h2><p>${subject}</p></div>`,
				status,
				priority: "normal",
				source: "transactional",
				tags: brand.tags,
				errorMessage,
				provider: "kumomta",
				providerMessageId: createId(),
				size: 3200 + Math.floor(Math.random() * 2400),
				sentAt: sentTime,
				deliveredAt: status === "delivered" ? deliveredTime : null,
				failedAt: status === "bounced" ? deliveredTime : null,
				createdAt: emailDate,
				updatedAt: deliveredTime,
			});

			currentBatchSends.push({
				id: sendId,
				organizationId: ORG_ID,
				organizationCreditsId: CREDITS_ID,
				emailLogId: logId,
				recipientEmail: recipient,
				countedInCredits: true,
				creditsConsumed: 1,
				status: status === "delivered" ? "sent" : status === "bounced" ? "bounced" : "sent",
				errorMessage,
				sentAt: sentTime,
				createdAt: emailDate,
			});

			if (status === "delivered") {
				currentBatchEvents.push({
					id: `ev_${createId()}`,
					emailLogId: logId,
					type: "delivered",
					createdAt: deliveredTime,
				});

				// ~52% open rate
				if (Math.random() < 0.52) {
					const openTime = new Date(deliveredTime.getTime() + (2 + Math.random() * 45) * 60 * 1000);
					currentBatchEvents.push({
						id: `ev_${createId()}`,
						emailLogId: logId,
						type: "opened",
						createdAt: openTime,
					});

					// ~15% overall click rate
					if (Math.random() < 0.28) {
						const clickTime = new Date(openTime.getTime() + (1 + Math.random() * 8) * 60 * 1000);
						currentBatchEvents.push({
							id: `ev_${createId()}`,
							emailLogId: logId,
							type: "clicked",
							createdAt: clickTime,
						});
					}
				}
			} else if (status === "bounced") {
				currentBatchEvents.push({
					id: `ev_${createId()}`,
					emailLogId: logId,
					type: "bounced",
					metadata: { reason: errorMessage },
					createdAt: deliveredTime,
				});
			} else if (status === "spam") {
				currentBatchEvents.push({
					id: `ev_${createId()}`,
					emailLogId: logId,
					type: "complaint",
					metadata: { reason: errorMessage },
					createdAt: deliveredTime,
				});
			}

			// Flush batch when threshold reached
			if (currentBatchLogs.length >= BATCH_SIZE) {
				await db.insert(emailLog).values(currentBatchLogs);
				await db.insert(emailSend).values(currentBatchSends);
				if (currentBatchEvents.length > 0) {
					await db.insert(emailEvent).values(currentBatchEvents);
				}
				insertedSoFar += currentBatchLogs.length;
				process.stdout.write(`\r   Inserted: ${insertedSoFar.toLocaleString()} / ${runningSum.toLocaleString()}`);
				currentBatchLogs = [];
				currentBatchSends = [];
				currentBatchEvents = [];
			}
		}
	}

	// Flush remaining
	if (currentBatchLogs.length > 0) {
		await db.insert(emailLog).values(currentBatchLogs);
		await db.insert(emailSend).values(currentBatchSends);
		if (currentBatchEvents.length > 0) {
			await db.insert(emailEvent).values(currentBatchEvents);
		}
		insertedSoFar += currentBatchLogs.length;
		process.stdout.write(`\r   Inserted: ${insertedSoFar.toLocaleString()} / ${runningSum.toLocaleString()}\n`);
	}

	console.log(`\n🎉 Successfully seeded ${runningSum.toLocaleString()} organic transactional emails!`);
	console.log("   • Dynamic weekday / weekend volume curves with realistic growth wave");
	console.log("   • Mid-month release peaks");
	console.log("   • Bounce rate strictly < 1.1%");
	console.log("   • Complaint rate strictly < 0.03%");
}

main().catch(console.error);
