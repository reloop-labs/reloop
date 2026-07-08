import type { PageAccent } from "../page-accents";

export type UseCaseEnrichment = {
	accent: PageAccent;
	metric: { label: string; value: string };
	code: string;
	flow: string[];
};

const useCaseEnrichment: Record<string, UseCaseEnrichment> = {
	"transactional-email": {
		accent: "blue",
		metric: { label: "P99 delivery", value: "< 2s" },
		code: `await reloop.emails.send({
  to: "user@company.com",
  subject: "Your receipt",
  html: renderReceipt(order),
});`,
		flow: [
			"Trigger from your app",
			"Reloop delivers via API/SMTP",
			"Webhook confirms delivery",
		],
	},
	"automated-email": {
		accent: "violet",
		metric: { label: "Automation", value: "Drip + lifecycle" },
		code: `await reloop.workflows.trigger({
  event: "user.signed_up",
  workflow: "welcome_series",
});`,
		flow: [
			"Define trigger event",
			"Reloop sends sequence",
			"Analytics per step",
		],
	},
	"ai-agent-inbox": {
		accent: "indigo",
		metric: { label: "Agent-ready", value: "Inbox API" },
		code: `const thread = await reloop.inbox.threads.get(id);
await reloop.inbox.drafts.create({
  threadId: thread.id,
  body: agentReply,
});`,
		flow: [
			"Agent reads thread",
			"Draft or send reply",
			"Human approves if needed",
		],
	},
	"inbound-email": {
		accent: "cyan",
		metric: { label: "Routing", value: "Webhooks" },
		code: `// POST /webhooks/inbound
{
  "from": "customer@acme.com",
  "subject": "Support request",
  "text": "..."
}`,
		flow: [
			"Mail arrives at your domain",
			"Reloop parses & POSTs webhook",
			"Your app routes the ticket",
		],
	},
	"system-monitoring-email": {
		accent: "slate",
		metric: { label: "Use case", value: "Alerts & ops" },
		code: `await reloop.emails.send({
  to: "oncall@team.com",
  subject: "[CRITICAL] API latency spike",
  text: alertPayload,
});`,
		flow: [
			"Monitoring fires alert",
			"SMTP/API sends instantly",
			"On-call receives in inbox",
		],
	},
	"password-reset-email": {
		accent: "orange",
		metric: { label: "Expected speed", value: "Seconds" },
		code: `await reloop.emails.send({
  to: user.email,
  subject: "Reset your password",
  html: resetLinkTemplate(token),
});`,
		flow: [
			"User clicks forgot password",
			"Tokenized link emailed",
			"Webhook tracks bounces",
		],
	},
	"welcome-email": {
		accent: "emerald",
		metric: { label: "Onboarding", value: "Day 0" },
		code: `await reloop.emails.send({
  to: newUser.email,
  subject: "Welcome to Acme",
  template: "welcome_v1",
});`,
		flow: [
			"Signup event fires",
			"Welcome email sends",
			"Optional series follows",
		],
	},
	"order-confirmation-email": {
		accent: "blue",
		metric: { label: "E-commerce", value: "Receipts" },
		code: `await reloop.emails.send({
  to: order.email,
  subject: \`Order #\${order.id} confirmed\`,
  html: orderReceiptHtml(order),
});`,
		flow: [
			"Checkout completes",
			"Receipt with line items",
			"Delivery webhook logged",
		],
	},
	"email-verification": {
		accent: "violet",
		metric: { label: "Verification", value: "Magic links" },
		code: `await reloop.emails.send({
  to: signup.email,
  subject: "Verify your email",
  html: verifyLink(otp),
});`,
		flow: [
			"User registers",
			"Verification link sent",
			"Account activated on click",
		],
	},
	"payment-receipt-email": {
		accent: "emerald",
		metric: { label: "Billing", value: "Stripe-ready" },
		code: `// On invoice.paid webhook
await reloop.emails.send({
  to: customer.email,
  subject: "Payment receipt",
  html: receiptTemplate(invoice),
});`,
		flow: ["Payment succeeds", "Receipt emailed automatically", "PDF optional"],
	},
};

export function getUseCaseEnrichment(slug: string): UseCaseEnrichment {
	return (
		useCaseEnrichment[slug] ?? {
			accent: "blue",
			metric: { label: "Delivery", value: "Fast" },
			code: "await reloop.emails.send({ /* ... */ });",
			flow: ["Integrate API", "Send email", "Track results"],
		}
	);
}
