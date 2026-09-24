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
import { eq } from "drizzle-orm";

const ORG_ID = "iFqWuHdDnZTRpFJZR2K9GCCUM0SUY9cO";
const DOMAIN_ID = "domain_ty715n44y3e1s21hy71wzkaf";
const USER_ID = "gnh2huMk8KRDj7DITanAN03tvhkSHOxY";
const API_KEY_ID = "api_key_m01dtsklt4w0xzaql5nixdxg";
const CREDITS_ID = "ocr_s09x6qcilogsi3zf8ysk3cab";
const SENDER_DOMAIN = "local.reloop.sh";
const SUPPORT_EMAIL = "support@local.reloop.sh";
const SUPPORT_NAME = "Reloop Support";
const MAILBOX_ID = "mbx_a1m36o38kjrbxge4qb9npac6";

interface MessageDef {
	sender: "customer" | "support";
	text: string;
	offsetMinutes: number; // minutes before now
}

interface ThreadDef {
	customer: { name: string; email: string };
	subject: string;
	label: { name: string; color: string };
	isStarred?: boolean;
	isImportant?: boolean;
	unread?: boolean;
	messages: MessageDef[];
}

const THREADS_DATA: ThreadDef[] = [
	{
		customer: { name: "Karri Saarinen", email: "karri.saarinen@linear.app" },
		subject: "Webhook delivery latency on EU edge cluster",
		label: { name: "Performance", color: "emerald" },
		isStarred: true,
		isImportant: true,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hi Reloop Support,\n\nWe've been seeing ~120ms P95 jitter on incoming webhook dispatches for our EU cluster (Frankfurt). Are you routing EU traffic through us-east egress proxies or is direct regional dispatch enabled for our account?\n\nBest,\nKarri",
				offsetMinutes: 180,
			},
			{
				sender: "support",
				text: "Hi Karri,\n\nThanks for reaching out! Your organization was currently routed through our default transatlantic relay pool. We have now provisioned a dedicated regional egress bridge in Frankfurt (fra-01) for linear.app.\n\nYou should see P95 drop below 35ms immediately. Let us know if you observe any further latency spikes.\n\nBest regards,\nReloop Support",
				offsetMinutes: 140,
			},
			{
				sender: "customer",
				text: "Just checked our Datadog APM dashboard — P95 is down to 21.4ms! Incredible turnaround, thank you team.",
				offsetMinutes: 95,
			},
		],
	},
	{
		customer: { name: "Guillermo Rauch", email: "guillermo.rauch@vercel.com" },
		subject: "Accelerating dedicated IP warm-up schedule for Next.js Conf",
		label: { name: "Enterprise", color: "indigo" },
		isStarred: true,
		isImportant: true,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hey Reloop team,\n\nWe're preparing for Next.js Conf next week and expect a 4x surge in transactional confirmation emails. Can we accelerate the warmup ramp on our two dedicated IP pools (198.51.100.14 and 198.51.100.15)?\n\nRegards,\nGuillermo",
				offsetMinutes: 320,
			},
			{
				sender: "support",
				text: "Hi Guillermo,\n\nAbsolutely! We've adjusted your IP warming policy to the accelerated enterprise tier. The daily throughput envelope is now raised to 500,000 sends/day with automated reputation health checks active.\n\nGood luck with the conference keynote!\n\nBest regards,\nReloop Support",
				offsetMinutes: 270,
			},
			{
				sender: "customer",
				text: "Thanks team, warmup graphs in the dashboard look super clean. Appreciate the fast assist!",
				offsetMinutes: 210,
			},
		],
	},
	{
		customer: { name: "Alex Moran", email: "alex.moran@stripe.com" },
		subject: "Custom DMARC alignment and 2048-bit DKIM selectors",
		label: { name: "Security", color: "purple" },
		isStarred: false,
		isImportant: false,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hello Support,\n\nWe are configuring a new subdomain billing.stripe-demo.com and need strict DMARC alignment (p=reject). Does Reloop support custom DKIM selector key lengths of 2048-bit on the enterprise plan?\n\nThanks,\nAlex",
				offsetMinutes: 480,
			},
			{
				sender: "support",
				text: "Hello Alex,\n\nYes, 2048-bit RSA keys are default for all custom domains. We also support ED25519 selectors if preferred. You can view the DNS verification tokens directly in your Domain Settings tab.\n\nBest,\nReloop Support",
				offsetMinutes: 440,
			},
			{
				sender: "customer",
				text: "Verified and green across all providers. Appreciate the quick response!",
				offsetMinutes: 390,
			},
		],
	},
	{
		customer: { name: "Paul Copplestone", email: "paul.copplestone@supabase.io" },
		subject: "KumoMTA spool queue persistence during Postgres failover",
		label: { name: "Integration", color: "blue" },
		isStarred: false,
		isImportant: false,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hey folks, quick architecture question: during automated PostgreSQL cluster failovers (which take ~15 seconds), how does KumoMTA buffer outgoing transaction logs? Do messages stay queued in memory or spool to disk?",
				offsetMinutes: 720,
			},
			{
				sender: "support",
				text: "Hi Paul,\n\nKumoMTA uses an on-disk RocksDB spool queue before attempting delivery. If database connection pools reset during failover, the spool holds all outbound messages safely with zero packet drops. Delivery resumes seamlessly as soon as the secondary replica promotes.\n\nBest,\nReloop Support",
				offsetMinutes: 660,
			},
		],
	},
	{
		customer: { name: "Dylan Field", email: "dylan.field@figma.com" },
		subject: "CSS custom properties inlining in transactional notifications",
		label: { name: "Integration", color: "blue" },
		isStarred: false,
		isImportant: false,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hi support team,\n\nDoes your HTML parser inline CSS variables (:root tokens) automatically before dispatch, or should we pass pre-compiled hex codes in our MJML template compiler?\n\nBest,\nDylan",
				offsetMinutes: 1100,
			},
			{
				sender: "support",
				text: "Hi Dylan,\n\nOur pre-send pipeline includes automated CSS variable resolution and inlining for maximum Outlook/Gmail compatibility. However, for bulletproof rendering on legacy mobile Outlook clients, pre-compiling fallbacks is always recommended.\n\nBest regards,\nReloop Support",
				offsetMinutes: 1040,
			},
		],
	},
	{
		customer: { name: "Sam Altman", email: "sam.altman@openai.com" },
		subject: "HMAC-SHA256 signature verification for audit log webhooks",
		label: { name: "Security", color: "purple" },
		isStarred: true,
		isImportant: true,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Team, we need to export all admin authentication and API key rotation events to our central Splunk SIEM via webhook. Does the audit log endpoint support HMAC-SHA256 signature verification?",
				offsetMinutes: 1560,
			},
			{
				sender: "support",
				text: "Hi Sam,\n\nYes, all audit logs and webhook dispatches include an x-reloop-signature header computed via HMAC-SHA256 with your webhook secret. Documentation and verification code samples are available in your developer console.\n\nBest,\nReloop Support",
				offsetMinutes: 1480,
			},
		],
	},
	{
		customer: { name: "Avery Penn", email: "avery.penn@tailscale.com" },
		subject: "Inbound SMTP TLS 1.3 cipher suites and PFS enforcement",
		label: { name: "Security", color: "purple" },
		isStarred: false,
		isImportant: false,
		unread: false,
		messages: [
			{
				sender: "customer",
				text: "Hello, we noticed our mail transfer agent negotiated TLS 1.3 with ChaCha20-Poly1305. Can we enforce forward secrecy cipher restrictions on inbound mailboxes?",
				offsetMinutes: 2160,
			},
			{
				sender: "support",
				text: "Hi Avery,\n\nStrict modern TLS (1.2 and 1.3 with PFS ciphers only) is globally enforced on inbound.local.reloop.sh. Insecure cipher suites are rejected during STARTTLS handshake.\n\nBest,\nReloop Support",
				offsetMinutes: 2050,
			},
		],
	},
	{
		customer: { name: "Tobi Lütke", email: "tobi.lutke@shopify.com" },
		subject: "Black Friday high-concurrency dispatch quotas inquiry",
		label: { name: "Enterprise", color: "indigo" },
		isStarred: true,
		isImportant: true,
		unread: true, // NEW UNREAD THREAD!
		messages: [
			{
				sender: "customer",
				text: "Hi Support team,\n\nWe're forecasting our peak BFCM transactional receipts volume. Can we schedule an architecture review to discuss increasing our concurrent SMTP inject channels from 16 to 64 connections next month?\n\nThanks,\nTobi",
				offsetMinutes: 24, // 24 minutes ago
			},
		],
	},
];

async function main() {
	console.log(`🚀 Seeding support inbox for ${SUPPORT_EMAIL}...`);
	const now = Date.now();

	// 1. Ensure mailbox is active
	await db
		.update(mailbox)
		.set({
			status: "active",
			displayName: "Customer Support",
		})
		.where(eq(mailbox.id, MAILBOX_ID));

	// 2. Clear old threads for this mailbox so we have pristine seed
	console.log("🧹 Clearing old threads for this mailbox...");
	await db.delete(emailThread).where(eq(emailThread.mailboxId, MAILBOX_ID));
	await db.delete(inboundEmail).where(eq(inboundEmail.mailboxId, MAILBOX_ID));
	await db.delete(emailLabel).where(eq(emailLabel.mailboxId, MAILBOX_ID));

	// 3. Create Labels
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
	console.log(`   ✓ Created ${labelsToCreate.length} inbox labels`);

	// 4. Insert Threads & Messages
	for (const threadDef of THREADS_DATA) {
		const threadId = `thr_${createId()}`;
		const firstMsg = threadDef.messages[0];
		const lastMsg = threadDef.messages[threadDef.messages.length - 1];

		const firstMsgTime = new Date(now - firstMsg.offsetMinutes * 60 * 1000);
		const lastMsgTime = new Date(now - lastMsg.offsetMinutes * 60 * 1000);

		const participants = [threadDef.customer.email, SUPPORT_EMAIL];

		// Create Thread
		await db.insert(emailThread).values({
			id: threadId,
			mailboxId: MAILBOX_ID,
			organizationId: ORG_ID,
			subject: threadDef.subject,
			lastMessagePreview: lastMsg.text.slice(0, 150),
			lastMessageAt: lastMsgTime,
			status: "active",
			messageCount: threadDef.messages.length,
			participants,
			isRead: !threadDef.unread,
			isStarred: Boolean(threadDef.isStarred),
			isImportant: Boolean(threadDef.isImportant),
			createdAt: firstMsgTime,
			updatedAt: lastMsgTime,
		});

		// Attach label
		const labelId = labelMap.get(threadDef.label.name);
		if (labelId) {
			await db.insert(threadLabel).values({
				threadId,
				labelId,
			});
		}

		// Insert messages in chronological order
		for (let i = 0; i < threadDef.messages.length; i++) {
			const m = threadDef.messages[i];
			const msgTime = new Date(now - m.offsetMinutes * 60 * 1000);
			const threadMsgId = `tmsg_${createId()}`;

			if (m.sender === "customer") {
				// Inbound email
				const inbId = `inb_${createId()}`;
				await db.insert(inboundEmail).values({
					id: inbId,
					mailboxId: MAILBOX_ID,
					organizationId: ORG_ID,
					fromEmail: threadDef.customer.email,
					fromName: threadDef.customer.name,
					toEmails: [SUPPORT_EMAIL],
					subject: i === 0 ? threadDef.subject : `Re: ${threadDef.subject}`,
					textBody: m.text,
					htmlBody: `<div style="font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a;">${m.text.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>`,
					snippet: m.text.slice(0, 150),
					status: "received",
					isRead: !threadDef.unread || i < threadDef.messages.length - 1,
					isStarred: Boolean(threadDef.isStarred),
					isSpam: false,
					threadId,
					date: msgTime,
					createdAt: msgTime,
				});

				await db.insert(threadMessage).values({
					id: threadMsgId,
					threadId,
					direction: "inbound",
					inboundEmailId: inbId,
					fromEmail: threadDef.customer.email,
					fromName: threadDef.customer.name,
					subject: i === 0 ? threadDef.subject : `Re: ${threadDef.subject}`,
					preview: m.text.slice(0, 150),
					messageAt: msgTime,
					createdAt: msgTime,
				});
			} else {
				// Outbound reply from support
				const emlId = `eml_${createId()}`;
				const messageId = `<${createId()}@${SENDER_DOMAIN}>`;
				const sentTime = new Date(msgTime.getTime() + 120);

				await db.insert(emailLog).values({
					id: emlId,
					messageId,
					organizationId: ORG_ID,
					domainId: DOMAIN_ID,
					userId: USER_ID,
					apikeyId: API_KEY_ID,
					fromEmail: SUPPORT_EMAIL,
					fromName: SUPPORT_NAME,
					toEmails: [threadDef.customer.email],
					subject: `Re: ${threadDef.subject}`,
					textBody: m.text,
					htmlBody: `<div style="font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a;">${m.text.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>`,
					status: "delivered",
					priority: "normal",
					source: "transactional",
					tags: [{ name: "type", value: "support-reply" }],
					provider: "kumomta",
					providerMessageId: createId(),
					size: 2800,
					sentAt: sentTime,
					deliveredAt: sentTime,
					createdAt: msgTime,
					updatedAt: sentTime,
				});

				await db.insert(emailSend).values({
					id: `esn_${createId()}`,
					organizationId: ORG_ID,
					organizationCreditsId: CREDITS_ID,
					emailLogId: emlId,
					recipientEmail: threadDef.customer.email,
					countedInCredits: true,
					creditsConsumed: 1,
					status: "sent",
					sentAt: sentTime,
					createdAt: msgTime,
				});

				await db.insert(threadMessage).values({
					id: threadMsgId,
					threadId,
					direction: "outbound",
					emailLogId: emlId,
					fromEmail: SUPPORT_EMAIL,
					fromName: SUPPORT_NAME,
					subject: `Re: ${threadDef.subject}`,
					preview: m.text.slice(0, 150),
					messageAt: msgTime,
					createdAt: msgTime,
				});
			}
		}

		console.log(`   ✓ Thread created: "${threadDef.subject}" (${threadDef.messages.length} messages)`);
	}

	console.log(`\n🎉 Successfully seeded ${THREADS_DATA.length} support conversation threads!`);
	console.log(`📬 Mailbox: ${SUPPORT_EMAIL}`);
	console.log(`🔗 URL: /inbox?mailboxId=${MAILBOX_ID}&folder=inbox`);
}

main().catch(console.error);
