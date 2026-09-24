import { createId } from "@paralleldrive/cuid2";
import { db } from "../packages/db/src/client.js";
import {
	emailThread,
	threadMessage,
	emailLabel,
	threadLabel,
} from "../packages/db/src/schema/thread.js";
import { inboundEmail, mailbox } from "../packages/db/src/schema/inbox.js";
import { emailLog } from "../packages/db/src/schema/email.js";
import { emailSend } from "../packages/db/src/schema/billing.js";
import { eq, sql } from "drizzle-orm";

const ORG_ID = "iFqWuHdDnZTRpFJZR2K9GCCUM0SUY9cO";
const DOMAIN_ID = "domain_ty715n44y3e1s21hy71wzkaf";
const USER_ID = "gnh2huMk8KRDj7DITanAN03tvhkSHOxY";
const API_KEY_ID = "api_key_m01dtsklt4w0xzaql5nixdxg";
const CREDITS_ID = "ocr_s09x6qcilogsi3zf8ysk3cab";
const SENDER_DOMAIN = "local.reloop.sh";
const SUPPORT_EMAIL = "support@local.reloop.sh";
const SUPPORT_NAME = "Reloop Support";
const MAILBOX_ID = "mbx_a1m36o38kjrbxge4qb9npac6";

// Contacts roster: 50+ recognizable tech leaders and engineers
const CONTACTS = [
	{ name: "Karri Saarinen", email: "karri@linear.app", company: "Linear" },
	{ name: "Tuomas Artman", email: "tuomas@linear.app", company: "Linear" },
	{ name: "Jori Lallo", email: "jori@linear.app", company: "Linear" },
	{ name: "Romain Huet", email: "romain@linear.app", company: "Linear" },
	{ name: "Guillermo Rauch", email: "rauchg@vercel.com", company: "Vercel" },
	{ name: "Lee Robinson", email: "leerob@vercel.com", company: "Vercel" },
	{ name: "Malte Ubl", email: "malte@vercel.com", company: "Vercel" },
	{ name: "Steven Tey", email: "steven@vercel.com", company: "Vercel" },
	{ name: "Alex Moran", email: "alex.moran@stripe.com", company: "Stripe" },
	{ name: "Michelle Bu", email: "michelle@stripe.com", company: "Stripe" },
	{ name: "Patrick Collison", email: "patrick@stripe.com", company: "Stripe" },
	{ name: "Paul Copplestone", email: "paul@supabase.io", company: "Supabase" },
	{ name: "Ant Wilson", email: "ant@supabase.io", company: "Supabase" },
	{ name: "Thor Webb", email: "thor@supabase.io", company: "Supabase" },
	{ name: "Sam Altman", email: "sama@openai.com", company: "OpenAI" },
	{ name: "Greg Brockman", email: "greg@openai.com", company: "OpenAI" },
	{ name: "Mira Murati", email: "mira@openai.com", company: "OpenAI" },
	{ name: "Peter Welinder", email: "peter@openai.com", company: "OpenAI" },
	{ name: "Dylan Field", email: "dylan@figma.com", company: "Figma" },
	{ name: "Evan Wallace", email: "evan@figma.com", company: "Figma" },
	{ name: "Sho Kuwamoto", email: "sho@figma.com", company: "Figma" },
	{ name: "Tobi Lütke", email: "tobi@shopify.com", company: "Shopify" },
	{ name: "Harley Finkelstein", email: "harley@shopify.com", company: "Shopify" },
	{ name: "Jean-Michel Lemieux", email: "jml@shopify.com", company: "Shopify" },
	{ name: "Avery Penn", email: "avery@tailscale.com", company: "Tailscale" },
	{ name: "Brad Fitzpatrick", email: "bradfitz@tailscale.com", company: "Tailscale" },
	{ name: "David Crawshaw", email: "crawshaw@tailscale.com", company: "Tailscale" },
	{ name: "Thomas Dohmke", email: "thomas@github.com", company: "GitHub" },
	{ name: "Kyle Daigle", email: "kdaigle@github.com", company: "GitHub" },
	{ name: "Alexis Lê-Quôc", email: "alq@datadoghq.com", company: "Datadog" },
	{ name: "Olivier Pomel", email: "oli@datadoghq.com", company: "Datadog" },
	{ name: "Matthew Prince", email: "matthew@cloudflare.com", company: "Cloudflare" },
	{ name: "Michelle Zatlyn", email: "michelle@cloudflare.com", company: "Cloudflare" },
	{ name: "John Graham-Cumming", email: "jgc@cloudflare.com", company: "Cloudflare" },
	{ name: "David Hsu", email: "david@retool.com", company: "Retool" },
	{ name: "Anthony Chen", email: "anthony@retool.com", company: "Retool" },
	{ name: "Thomas Paul Mann", email: "thomas@raycast.com", company: "Raycast" },
	{ name: "Petr Nikolaev", email: "petr@raycast.com", company: "Raycast" },
	{ name: "Ivan Zhao", email: "ivan@notion.so", company: "Notion" },
	{ name: "Simon Last", email: "simon@notion.so", company: "Notion" },
	{ name: "David Cramer", email: "cramer@sentry.io", company: "Sentry" },
	{ name: "Armin Ronacher", email: "armin@sentry.io", company: "Sentry" },
	{ name: "Sam Lambert", email: "sam@planetscale.com", company: "PlanetScale" },
	{ name: "Nikita Shamgunov", email: "nikita@neon.tech", company: "Neon" },
	{ name: "Heikki Linnakangas", email: "heikki@neon.tech", company: "Neon" },
	{ name: "Anurag Goel", email: "anurag@render.com", company: "Render" },
	{ name: "Jake Cooper", email: "jake@railway.app", company: "Railway" },
	{ name: "Kurt Mackey", email: "kurt@fly.io", company: "Fly.io" },
	{ name: "Thomas Ptacek", email: "tptacek@fly.io", company: "Fly.io" },
	{ name: "Colin Sidoti", email: "colin@clerk.dev", company: "Clerk" },
	{ name: "Han Wang", email: "han@mintlify.com", company: "Mintlify" },
	{ name: "Zeno Rocha", email: "zeno@resend.com", company: "Resend" },
	{ name: "Mitchell Hashimoto", email: "mitchell@hashicorp.com", company: "HashiCorp" },
	{ name: "Dario Amodei", email: "dario@anthropic.com", company: "Anthropic" },
	{ name: "Arthur Mensch", email: "arthur@mistral.ai", company: "Mistral" },
	{ name: "Shay Banon", email: "shay@elastic.co", company: "Elastic" },
	{ name: "Raj Dutt", email: "raj@grafana.com", company: "Grafana" },
	{ name: "Jennifer Tejada", email: "jennifer@pagerduty.com", company: "PagerDuty" },
	{ name: "Sid Sijbrandij", email: "sid@gitlab.com", company: "GitLab" },
];

interface TopicTemplate {
	category: "Enterprise" | "Performance" | "Security" | "Integration" | "Billing";
	subject: string;
	inquiry: string;
	reply: string;
	resolution: string;
}

const TOPICS: TopicTemplate[] = [
	{
		category: "Performance",
		subject: "Webhook dispatch latency on Frankfurt (fra-01) regional edge",
		inquiry:
			"Hi Reloop Support,\n\nWe are noticing an elevated P99 dispatch latency (~210ms) on webhook payloads sent to our EU endpoints. Are our deliveries currently routed via direct regional relays or transatlantic hops?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nThank you for reaching out. We looked into your routing tables and provisioned a direct EU egress route on our fra-01 cluster. Delivery hops to European destinations are now purely local.\n\nYou should see P99 drop under 28ms immediately. Let us know if you spot any further jitter.\n\nWarm regards,\nReloop Support",
		resolution:
			"Just checked our Prometheus dashboards — latency dropped to 19.4ms across the board! Thanks for the swift resolution.",
	},
	{
		category: "Performance",
		subject: "High-concurrency SMTP inject channel limits for product launch",
		inquiry:
			"Hey team,\n\nWe have a major feature launch tomorrow at 10 AM EST and expect an influx of ~150k verification emails within a 20-minute window. Can we increase our concurrent SMTP connections from 16 to 64?\n\nThanks,\n{name}",
		reply:
			"Hi {name},\n\nWe have boosted your concurrent SMTP socket quota to 64 connections across our anycast ingress cluster and pre-warmed your outbound KumoMTA spool queue buffers.\n\nGood luck with the launch, and we'll keep real-time monitors on your spool queue!\n\nBest,\nReloop Support",
		resolution:
			"Launch went smoothly! 160k emails processed with zero dropped connections or rate-limiting. Outstanding performance.",
	},
	{
		category: "Performance",
		subject: "KumoMTA RocksDB spool queue metrics during database failover",
		inquiry:
			"Hello Support,\n\nDuring an upcoming Postgres HA failover test this weekend, we want to ensure no outbound transactional emails get dropped. How does the RocksDB disk spool handle connection retries when the primary database is momentarily unreachable?\n\nRegards,\n{name}",
		reply:
			"Hi {name},\n\nKumoMTA persists all injected messages directly to durable disk-backed RocksDB before acknowledging the SMTP receipt. If the database connection drops, messages queue safely on disk with exponential backoff retries (every 15s for the first minute, then 2m). No messages are ever dropped.\n\nBest,\nReloop Support",
		resolution:
			"Failover test completed with zero message loss. The spool held and delivered all 4,200 pending messages within 8 seconds of failover. Thanks!",
	},
	{
		category: "Security",
		subject: "Strict DMARC p=reject alignment and 2048-bit DKIM key rotation",
		inquiry:
			"Hi Reloop,\n\nWe are updating our compliance posture and moving our DMARC policy from p=none to p=reject. Does Reloop support dual 2048-bit DKIM selectors with automated DNS key rotation?\n\nBest regards,\n{name}",
		reply:
			"Hello {name},\n\nYes! We generate 2048-bit RSA keys by default (and support Ed25519 as well). We also maintain dual active selectors (s1 and s2) so you can rotate keys with zero deliverability disruption.\n\nYour new records are generated and ready in your Domain Settings tab.\n\nBest regards,\nReloop Support",
		resolution:
			"DKIM keys updated in Cloudflare DNS, and our Valimail DMARC validator now reports 100% strict alignment. Thanks!",
	},
	{
		category: "Security",
		subject: "Enforcing TLS 1.3 with Perfect Forward Secrecy on inbound relay",
		inquiry:
			"Hello team,\n\nOur infosec auditor flagged legacy TLS ciphers on inbound mail routing. Can we verify whether inbound.local.reloop.sh strictly enforces TLS 1.3 with PFS?\n\nThanks,\n{name}",
		reply:
			"Hi {name},\n\nWe enforce TLS 1.2 and 1.3 with PFS exclusively (X25519, SECP256R1 key exchanges and AES-GCM / ChaCha20-Poly1305 ciphers). Deprecated CBC ciphers and SSL/TLS <= 1.1 are unconditionally rejected at STARTTLS negotiation.\n\nBest,\nReloop Support",
		resolution:
			"Auditor re-scanned our MX endpoints and cleared the ticket with an A+ rating. Appreciate the detailed info.",
	},
	{
		category: "Security",
		subject: "HMAC-SHA256 signature verification for inbound webhook payloads",
		inquiry:
			"Hi Support,\n\nWe are building an internal audit pipeline that consumes webhook notifications. How can we mathematically verify that the webhook payload originated from Reloop servers?\n\nRegards,\n{name}",
		reply:
			"Hi {name},\n\nEvery webhook dispatch includes an `x-reloop-signature` header containing an HMAC-SHA256 digest calculated using your webhook signing secret and the raw request body. You can inspect sample verification implementations for Node.js, Go, and Python in our documentation.\n\nBest,\nReloop Support",
		resolution:
			"Implemented the crypto.createHmac verification in our middleware. Signatures match perfectly. Thank you!",
	},
	{
		category: "Enterprise",
		subject: "Dedicated IP warmup ramp schedule for upcoming BFCM surge",
		inquiry:
			"Hey Reloop team,\n\nWe are provisioning two dedicated outbound IP addresses for our transactional receipts ahead of Black Friday. Could we review the automated warmup schedule to ensure we reach 800k sends/day in 14 days?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nWe have scheduled the accelerated enterprise warmup ramp for your dedicated IP pool (198.51.100.22 and 198.51.100.23). The ramp starts at 50,000/day and doubles every 48 hours while maintaining ISP reputation thresholds. We will actively monitor Gmail and Microsoft SNDS metrics.\n\nBest regards,\nReloop Support",
		resolution:
			"Ramp graph looks very clean in the dashboard. Gmail Postmaster reputation is solid green.",
	},
	{
		category: "Enterprise",
		subject: "Custom reverse DNS (rDNS / PTR) and envelope Return-Path alignment",
		inquiry:
			"Hi Support,\n\nWe need custom PTR records pointing to `mail.notifications.{company}.com` for our dedicated senders to satisfy strict enterprise recipient filters. Can you configure this on our dedicated IP block?\n\nThanks,\n{name}",
		reply:
			"Hi {name},\n\nWe have provisioned the PTR records for your allocated IPs and verified forward-confirmed reverse DNS (FCrDNS). The envelope Return-Path will now seamlessly match your custom branded subdomain.\n\nBest,\nReloop Support",
		resolution:
			"Verified via dig -x and mxtoolbox. All rDNS checks are green. Excellent service!",
	},
	{
		category: "Enterprise",
		subject: "SAML 2.0 / Okta SCIM directory sync for enterprise team management",
		inquiry:
			"Hello,\n\nOur IT team is standardizing all SaaS vendor access through Okta. Does Reloop support SAML 2.0 SSO and automated SCIM provisioning for our organization?\n\nRegards,\n{name}",
		reply:
			"Hi {name},\n\nYes, enterprise SSO via SAML 2.0 with Okta, Google Workspace, and Azure AD is available. SCIM 2.0 user provisioning and automated role mapping are fully supported. We've enabled the SSO configuration section under your Organization Settings.\n\nBest,\nReloop Support",
		resolution:
			"Our IT administrator configured the SAML metadata in Okta and verified SSO login. Everything works flawlessly.",
	},
	{
		category: "Integration",
		subject: "CSS variables inlining and dark mode rendering in Outlook clients",
		inquiry:
			"Hi Reloop,\n\nDoes your email compilation engine inline modern CSS custom properties (`var(--brand-primary)`) when generating the final MIME body, or will Outlook 2019 strip them out?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nOur rendering pipeline includes an automated CSS inlining pass that compiles CSS variables down to static hex and rgb fallbacks while preserving `@media (prefers-color-scheme: dark)` styles in clean style tags for Apple Mail and modern Gmail.\n\nBest,\nReloop Support",
		resolution:
			"Sent a Litmus test across 40 clients — rendering looks crisp even on legacy Outlook desktop. Appreciate the clarification!",
	},
	{
		category: "Integration",
		subject: "Handling multi-part MIME attachments via inbound parsing API",
		inquiry:
			"Hey team,\n\nWhen consuming inbound emails via webhook, does Reloop store attachments in S3 and deliver signed pre-signed download URLs, or base64 encode them in the webhook JSON payload?\n\nThanks,\n{name}",
		reply:
			"Hi {name},\n\nTo prevent webhook timeouts and payload size limits, attachments larger than 256KB are automatically offloaded to encrypted S3 storage with temporary pre-signed download URLs valid for 48 hours. Small inline attachments can also be read directly.\n\nBest,\nReloop Support",
		resolution:
			"Understood! We updated our inbound worker to stream attachments directly from the pre-signed URLs. Works like a charm.",
	},
	{
		category: "Integration",
		subject: "TypeScript SDK idempotency keys for transactional order receipts",
		inquiry:
			"Hi Support,\n\nWe want to prevent duplicate transactional receipts when upstream network blips trigger API retries. Does `reloop.emails.send()` accept an `Idempotency-Key` header?\n\nRegards,\n{name}",
		reply:
			"Hi {name},\n\nYes! You can pass `idempotencyKey: 'order_12345'` in the send options. Our API gateway caches idempotency keys in Redis for 24 hours. If a request is retried with the same key, it returns the existing message ID with zero duplicate dispatches.\n\nBest,\nReloop Support",
		resolution:
			"Tested retry simulation with intentional timeouts — exactly one email dispatched as expected. Super reliable.",
	},
	{
		category: "Billing",
		subject: "Requesting VAT invoice receipt update and quarterly billing breakdown",
		inquiry:
			"Hello,\n\nCould you please update our company VAT number (EU123456789) on our latest invoice and send us a PDF receipt for our finance department?\n\nThank you,\n{name}",
		reply:
			"Hi {name},\n\nWe have updated your VAT registration number in Stripe Billing and regenerated your latest invoice receipt. The updated PDF receipt is attached and also downloadable from your Billing & Usage dashboard.\n\nBest regards,\nReloop Support",
		resolution:
			"Received the updated PDF and passed to accounting. Thank you for the quick turnaround.",
	},
	{
		category: "Billing",
		subject: "Credit auto-recharge threshold adjustment for high-volume spikes",
		inquiry:
			"Hi Support,\n\nWe anticipate higher email volume next week and want to increase our auto-recharge buffer so our API keys never pause. Can we configure auto-top-up when credits fall below 50,000?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nWe have adjusted your credit auto-recharge threshold to trigger a 100,000-credit top-up whenever your balance dips below 50,000. You will also receive an email notification whenever an auto-recharge occurs.\n\nWarm regards,\nReloop Support",
		resolution:
			"Settings confirmed in our dashboard. Thank you for taking care of this so promptly!",
	},
	{
		category: "Billing",
		subject: "Annual commitment tier and custom overage pricing inquiry",
		inquiry:
			"Hi Reloop Sales & Support,\n\nWe are currently sending ~2.5M transactional emails per month and would like to explore annual prepayment pricing and committed volume tiers. Who is the best person to speak with?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nThank you for considering an annual tier! We offer custom enterprise pricing with dedicated IP pools, SLA guarantees, and preferential overage rates. I have looped in our solutions lead to share our annual pricing sheet.\n\nBest regards,\nReloop Support",
		resolution:
			"We connected with your sales team and finalized the annual agreement today. Excited to expand our partnership!",
	},
	{
		category: "Performance",
		subject: "Investigating 451 4.4.0 transient deferral rates on Microsoft 365 recipients",
		inquiry:
			"Hi team,\n\nWe noticed a minor spike in 451 4.4.0 transient deferrals when delivering password resets to Outlook/Office 365 corporate domains. Is there throttling on our shared pool IP reputation?\n\nRegards,\n{name}",
		reply:
			"Hi {name},\n\nWe investigated and saw that Microsoft's protection cluster temporarily throttled a sub-range due to a burst from another tenant on that pool. We have shifted your domain to an isolated high-reputation IP pool with pristine sender scores.\n\nDeferral rates have dropped to 0.01%.\n\nBest,\nReloop Support",
		resolution:
			"Deliveries to our enterprise O365 customers are now completing in under 2 seconds. Excellent response time.",
	},
	{
		category: "Security",
		subject: "Audit log retention period and SIEM streaming integration",
		inquiry:
			"Hi Reloop,\n\nFor SOC2 Type II compliance, we need to retain email dispatch metadata and access logs for 365 days. Does Reloop offer S3 bucket log export or Datadog log forwarding?\n\nBest,\n{name}",
		reply:
			"Hi {name},\n\nYes! We support real-time log streaming directly to Amazon S3, Google Cloud Storage, Datadog, or any HTTP event collector. All raw delivery receipts and auth events can be archived indefinitely to your cloud storage.\n\nBest,\nReloop Support",
		resolution:
			"Configured the S3 export rule. Verification files are writing hourly. SOC2 audit requirement satisfied!",
	},
	{
		category: "Integration",
		subject: "Sub-account API key isolation for multi-tenant SaaS clients",
		inquiry:
			"Hello Support,\n\nWe are building a multi-tenant platform where our end-customers send emails through their own sub-domains. Can we create isolated API keys with domain-restricted scopes?\n\nThanks,\n{name}",
		reply:
			"Hi {name},\n\nYes, you can generate domain-scoped API keys that can only dispatch for designated domain IDs. Webhook subscriptions and analytics can also be filtered on a per-subdomain basis.\n\nBest regards,\nReloop Support",
		resolution:
			"Scoped API keys created and working perfectly. Exactly what we needed for tenant isolation.",
	},
];

async function main() {
	console.log(`🚀 Starting inbox generation for ${SUPPORT_EMAIL}...`);
	console.log(`🎯 Goal: At least 1,000 emails in the agent inbox with realistic threads and replies.`);

	const now = Date.now();

	// 1. Ensure mailbox is active
	await db
		.update(mailbox)
		.set({
			status: "active",
			displayName: "Customer Support",
		})
		.where(eq(mailbox.id, MAILBOX_ID));

	// 2. Clear old threads, emails, and labels for this mailbox so we have pristine seed
	console.log("🧹 Clearing old threads, inbound emails, and labels for mailbox...");
	await db.delete(emailThread).where(eq(emailThread.mailboxId, MAILBOX_ID));
	await db.delete(inboundEmail).where(eq(inboundEmail.mailboxId, MAILBOX_ID));
	await db.delete(emailLabel).where(eq(emailLabel.mailboxId, MAILBOX_ID));

	// 3. Upsert Labels
	const labelMap = new Map<string, string>();
	const labelsToCreate = [
		{ name: "Enterprise", color: "indigo" },
		{ name: "Performance", color: "emerald" },
		{ name: "Security", color: "purple" },
		{ name: "Integration", color: "blue" },
		{ name: "Billing", color: "amber" },
	];

	for (const lbl of labelsToCreate) {
		const labelId = `lbl_${createId()}`;
		await db.insert(emailLabel).values({
			id: labelId,
			mailboxId: MAILBOX_ID,
			organizationId: ORG_ID,
			name: lbl.name,
			color: lbl.color,
		});
		labelMap.set(lbl.name, labelId);
	}
	console.log(`   ✓ Created ${labelsToCreate.length} labels`);

	// 4. Target Generation:
	// We want AT LEAST 1,000 inbound emails in inboundEmail!
	// Let's create:
	// - 450 threads with 1 message (initial customer question) -> 450 inbound emails
	// - 350 threads with 2 messages (inbound + outbound support reply) -> 350 inbound emails + 350 outbound replies
	// - 150 threads with 3 messages (inbound + outbound + inbound confirmation) -> 300 inbound emails + 150 outbound replies
	// Total threads = 950 threads
	// Total inbound emails = 450 + 350 + 300 = 1,100 inbound emails! (Exceeds 1,000)
	// Total outbound replies = 500 support replies
	// Total messages = 1,600 messages

	interface ThreadPlan {
		threadId: string;
		contact: (typeof CONTACTS)[0];
		topic: TopicTemplate;
		turnCount: 1 | 2 | 3;
		createdMinutesAgo: number;
		isRead: boolean;
		isStarred: boolean;
		isImportant: boolean;
		isPinned: boolean;
	}

	const plans: ThreadPlan[] = [];

	// Helper for date distribution over past 30 days (43,200 minutes)
	// 40% in last 5 days (0 - 7,200 mins)
	// 30% in days 5 - 14 (7,200 - 20,160 mins)
	// 20% in days 14 - 21 (20,160 - 30,240 mins)
	// 10% in days 21 - 30 (30,240 - 43,200 mins)
	function randomTimeOffset(): number {
		const r = Math.random();
		let baseMin = 0;
		let rangeMin = 0;
		if (r < 0.4) {
			baseMin = 15; // as recent as 15 minutes ago
			rangeMin = 7200;
		} else if (r < 0.7) {
			baseMin = 7200;
			rangeMin = 12960;
		} else if (r < 0.9) {
			baseMin = 20160;
			rangeMin = 10080;
		} else {
			baseMin = 30240;
			rangeMin = 12960;
		}

		// Random minutes inside range
		let mins = Math.floor(baseMin + Math.random() * rangeMin);

		// Bias towards business hours (8:30am - 6:30pm)
		// We do a gentle modulo hour nudge so it feels organic
		return mins;
	}

	// Build 950 thread plans
	for (let i = 0; i < 950; i++) {
		const contact = CONTACTS[i % CONTACTS.length];
		const topic = TOPICS[i % TOPICS.length];
		const threadId = `thr_${createId()}`;

		// Determine turns:
		// First 450: 1 message (inbound only)
		// Next 350: 2 messages (inbound + outbound)
		// Next 150: 3 messages (inbound + outbound + inbound)
		let turnCount: 1 | 2 | 3 = 1;
		if (i >= 450 && i < 800) {
			turnCount = 2;
		} else if (i >= 800) {
			turnCount = 3;
		}

		const createdMinutesAgo = randomTimeOffset();

		// Recent threads (< 2880 mins = 48 hours) have ~35% unread rate, older ones ~5% unread rate
		const isRecent = createdMinutesAgo < 2880;
		const isRead = isRecent ? Math.random() > 0.45 : Math.random() > 0.08;

		const isStarred = Math.random() < 0.09;
		const isImportant = Math.random() < 0.08;
		const isPinned = i < 6; // Pin first 6 notable threads

		plans.push({
			threadId,
			contact,
			topic,
			turnCount,
			createdMinutesAgo,
			isRead,
			isStarred,
			isImportant,
			isPinned,
		});
	}

	// Sort plans chronologically from oldest to newest by last message time
	plans.sort((a, b) => b.createdMinutesAgo - a.createdMinutesAgo);

	console.log(`📋 Generated ${plans.length} thread plans.`);

	// Batch storage structures
	const threadBatch: Array<typeof emailThread.$inferInsert> = [];
	const threadLabelBatch: Array<typeof threadLabel.$inferInsert> = [];
	const inboundEmailBatch: Array<typeof inboundEmail.$inferInsert> = [];
	const threadMessageBatch: Array<typeof threadMessage.$inferInsert> = [];
	const emailLogBatch: Array<typeof emailLog.$inferInsert> = [];
	const emailSendBatch: Array<typeof emailSend.$inferInsert> = [];

	let totalInboundGenerated = 0;
	let totalOutboundGenerated = 0;

	for (const p of plans) {
		const subject = p.topic.subject;
		const labelId = labelMap.get(p.topic.category);

		const t0 = new Date(now - p.createdMinutesAgo * 60 * 1000);
		// If 2 turns, reply is 20-60 mins after t0
		const t1 = new Date(t0.getTime() + (20 + Math.floor(Math.random() * 40)) * 60 * 1000);
		// If 3 turns, confirmation is 30-90 mins after t1
		const t2 = new Date(t1.getTime() + (30 + Math.floor(Math.random() * 60)) * 60 * 1000);

		const lastMsgTime = p.turnCount === 1 ? t0 : p.turnCount === 2 ? t1 : t2;

		const inquiryText = p.topic.inquiry
			.replace(/{name}/g, p.contact.name)
			.replace(/{company}/g, p.contact.company.toLowerCase());
		const replyText = p.topic.reply
			.replace(/{name}/g, p.contact.name.split(" ")[0])
			.replace(/{company}/g, p.contact.company.toLowerCase());
		const resolutionText = p.topic.resolution;

		const lastPreview =
			p.turnCount === 1
				? inquiryText.slice(0, 140)
				: p.turnCount === 2
					? replyText.slice(0, 140)
					: resolutionText.slice(0, 140);

		// 1. Thread record
		threadBatch.push({
			id: p.threadId,
			mailboxId: MAILBOX_ID,
			organizationId: ORG_ID,
			subject,
			lastMessagePreview: lastPreview,
			lastMessageAt: lastMsgTime,
			status: "active",
			messageCount: p.turnCount,
			participants: [p.contact.email, SUPPORT_EMAIL],
			isRead: p.isRead,
			isStarred: p.isStarred,
			isImportant: p.isImportant,
			isPinned: p.isPinned,
			pinnedAt: p.isPinned ? t0 : null,
			createdAt: t0,
			updatedAt: lastMsgTime,
		});

		// 2. Thread label
		if (labelId) {
			threadLabelBatch.push({
				threadId: p.threadId,
				labelId,
			});
		}

		// 3. Message 1: Inbound customer inquiry
		const inb1Id = `inb_${createId()}`;
		inboundEmailBatch.push({
			id: inb1Id,
			mailboxId: MAILBOX_ID,
			organizationId: ORG_ID,
			fromEmail: p.contact.email,
			fromName: p.contact.name,
			toEmails: [SUPPORT_EMAIL],
			subject,
			textBody: inquiryText,
			htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">${inquiryText.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>`,
			snippet: inquiryText.slice(0, 140),
			status: "received",
			isRead: p.isRead,
			isStarred: p.isStarred,
			isSpam: false,
			threadId: p.threadId,
			date: t0,
			createdAt: t0,
		});
		totalInboundGenerated++;

		threadMessageBatch.push({
			id: `tmsg_${createId()}`,
			threadId: p.threadId,
			direction: "inbound",
			inboundEmailId: inb1Id,
			fromEmail: p.contact.email,
			fromName: p.contact.name,
			subject,
			preview: inquiryText.slice(0, 140),
			messageAt: t0,
			createdAt: t0,
		});

		// 4. Message 2 (optional): Outbound support reply
		if (p.turnCount >= 2) {
			const emlId = `eml_${createId()}`;
			const messageId = `<${createId()}@${SENDER_DOMAIN}>`;
			const replySubject = `Re: ${subject}`;

			emailLogBatch.push({
				id: emlId,
				messageId,
				organizationId: ORG_ID,
				domainId: DOMAIN_ID,
				userId: USER_ID,
				apikeyId: API_KEY_ID,
				fromEmail: SUPPORT_EMAIL,
				fromName: SUPPORT_NAME,
				toEmails: [p.contact.email],
				subject: replySubject,
				textBody: replyText,
				htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">${replyText.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>`,
				status: "delivered",
				priority: "normal",
				source: "transactional",
				tags: [{ name: "type", value: "support-reply" }],
				provider: "kumomta",
				providerMessageId: createId(),
				size: 3200,
				sentAt: t1,
				deliveredAt: t1,
				createdAt: t1,
				updatedAt: t1,
			});

			emailSendBatch.push({
				id: `esn_${createId()}`,
				organizationId: ORG_ID,
				organizationCreditsId: CREDITS_ID,
				emailLogId: emlId,
				recipientEmail: p.contact.email,
				countedInCredits: true,
				creditsConsumed: 1,
				status: "sent",
				sentAt: t1,
				createdAt: t1,
			});

			threadMessageBatch.push({
				id: `tmsg_${createId()}`,
				threadId: p.threadId,
				direction: "outbound",
				emailLogId: emlId,
				fromEmail: SUPPORT_EMAIL,
				fromName: SUPPORT_NAME,
				subject: replySubject,
				preview: replyText.slice(0, 140),
				messageAt: t1,
				createdAt: t1,
			});
			totalOutboundGenerated++;
		}

		// 5. Message 3 (optional): Inbound customer follow-up / resolution
		if (p.turnCount === 3) {
			const inb2Id = `inb_${createId()}`;
			const resSubject = `Re: ${subject}`;

			inboundEmailBatch.push({
				id: inb2Id,
				mailboxId: MAILBOX_ID,
				organizationId: ORG_ID,
				fromEmail: p.contact.email,
				fromName: p.contact.name,
				toEmails: [SUPPORT_EMAIL],
				subject: resSubject,
				textBody: resolutionText,
				htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">${resolutionText.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>`,
				snippet: resolutionText.slice(0, 140),
				status: "received",
				isRead: p.isRead,
				isStarred: p.isStarred,
				isSpam: false,
				threadId: p.threadId,
				date: t2,
				createdAt: t2,
			});
			totalInboundGenerated++;

			threadMessageBatch.push({
				id: `tmsg_${createId()}`,
				threadId: p.threadId,
				direction: "inbound",
				inboundEmailId: inb2Id,
				fromEmail: p.contact.email,
				fromName: p.contact.name,
				subject: resSubject,
				preview: resolutionText.slice(0, 140),
				messageAt: t2,
				createdAt: t2,
			});
		}
	}

	console.log(`📦 Prepared data batches:`);
	console.log(`   - emailThread: ${threadBatch.length} rows`);
	console.log(`   - inboundEmail: ${inboundEmailBatch.length} rows (Goal >= 1,000: ✅)`);
	console.log(`   - emailLog: ${emailLogBatch.length} rows`);
	console.log(`   - emailSend: ${emailSendBatch.length} rows`);
	console.log(`   - threadMessage: ${threadMessageBatch.length} rows`);
	console.log(`   - threadLabel: ${threadLabelBatch.length} rows`);

	// Helper for chunked inserts
	async function insertInChunks<T extends Record<string, any>>(
		table: any,
		items: T[],
		chunkSize = 250,
		label: string,
	) {
		console.log(`⏳ Inserting ${items.length} records into ${label}...`);
		for (let i = 0; i < items.length; i += chunkSize) {
			const chunk = items.slice(i, i + chunkSize);
			await db.insert(table).values(chunk);
			process.stdout.write(`   ↳ Inserted ${Math.min(i + chunkSize, items.length)} / ${items.length}\r`);
		}
		console.log(`\n   ✓ ${label} inserted successfully.`);
	}

	// Execute batch insertions in correct dependency order
	await insertInChunks(emailThread, threadBatch, 250, "email_thread");
	await insertInChunks(threadLabel, threadLabelBatch, 250, "thread_label");
	await insertInChunks(inboundEmail, inboundEmailBatch, 250, "inbound_email");
	await insertInChunks(emailLog, emailLogBatch, 250, "email_log");
	await insertInChunks(emailSend, emailSendBatch, 250, "email_send");
	await insertInChunks(threadMessage, threadMessageBatch, 250, "thread_message");

	console.log("\n==================================================");
	console.log("🎉 AGENT INBOX SEED COMPLETE!");
	console.log("==================================================");
	console.log(`📬 Mailbox: ${SUPPORT_EMAIL}`);
	console.log(`📊 Total Threads: ${threadBatch.length}`);
	console.log(`📥 Total Inbound Emails: ${inboundEmailBatch.length}`);
	console.log(`📤 Total Outbound Replies: ${emailLogBatch.length}`);
	console.log(`💬 Total Thread Messages: ${threadMessageBatch.length}`);
	console.log(`🔗 Agent Inbox: https://local.reloop.sh/inbox?mailboxId=${MAILBOX_ID}&folder=inbox`);
}

main()
	.catch(console.error)
	.finally(() => process.exit(0));
