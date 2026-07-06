import type { PageAccent } from "../page-accents";

export type IntegrationEnrichment = {
	accent: PageAccent;
	install: string;
	language: string;
	code: string;
	steps: { title: string; body: string }[];
};

export const integrationEnrichment: Record<string, IntegrationEnrichment> = {
	nextjs: {
		accent: "slate",
		install: "npm install reloop-email",
		language: "TypeScript",
		code: `// app/api/send/route.ts
import Reloop from "reloop-email";

export async function POST() {
  const reloop = new Reloop(process.env.RELOOP_API_KEY!);
  await reloop.emails.send({ to, subject, html });
  return Response.json({ ok: true });
}`,
		steps: [
			{
				title: "Add API key",
				body: "Set RELOOP_API_KEY in .env.local and Vercel.",
			},
			{
				title: "Send from Route Handler",
				body: "Call the SDK in a Server Action or API route.",
			},
			{
				title: "Verify domain",
				body: "Add DNS records in the Reloop dashboard.",
			},
		],
	},
	express: {
		accent: "emerald",
		install: "npm install reloop-email",
		language: "Node.js",
		code: `app.post("/notify", async (req, res) => {
  await reloop.emails.send({
    to: req.body.email,
    subject: "Notification",
    html: "<p>Hello</p>",
  });
  res.json({ sent: true });
});`,
		steps: [
			{
				title: "Install SDK",
				body: "npm install reloop-email in your Express app.",
			},
			{
				title: "Send on events",
				body: "Trigger sends from route handlers or jobs.",
			},
			{
				title: "Handle webhooks",
				body: "Listen for bounce events on /webhooks/reloop.",
			},
		],
	},
	laravel: {
		accent: "rose",
		install: "composer require reloop/reloop-email",
		language: "PHP",
		code: `Mail::mailer('reloop')->send(new OrderShipped($order));

// config/mail.php → SMTP or API driver`,
		steps: [
			{
				title: "Configure mailer",
				body: "Point Laravel Mail to Reloop SMTP or SDK.",
			},
			{
				title: "Use Mailables",
				body: "Keep Action Mailer patterns you already use.",
			},
			{
				title: "Queue sends",
				body: "Dispatch mail jobs with Horizon or Redis.",
			},
		],
	},
	django: {
		accent: "emerald",
		install: "pip install reloop-email",
		language: "Python",
		code: `# settings.py
EMAIL_HOST = "smtp.reloop.dev"
EMAIL_HOST_USER = "reloop"
EMAIL_HOST_PASSWORD = os.environ["RELOOP_API_KEY"]`,
		steps: [
			{
				title: "SMTP backend",
				body: "Configure Django email settings for Reloop SMTP.",
			},
			{
				title: "Or use SDK",
				body: "Call reloop-email in Celery tasks for templates.",
			},
			{ title: "Test locally", body: "Send a test mail from manage.py shell." },
		],
	},
	fastapi: {
		accent: "cyan",
		install: "pip install reloop-email",
		language: "Python",
		code: `@app.post("/send")
async def send_email(payload: EmailPayload):
    reloop = Reloop(api_key=settings.RELOOP_API_KEY)
    return reloop.emails.send(payload.dict())`,
		steps: [
			{
				title: "Async sends",
				body: "Use BackgroundTasks or Celery for non-blocking mail.",
			},
			{
				title: "Type-safe payloads",
				body: "Validate requests with Pydantic models.",
			},
			{ title: "Webhooks", body: "Expose /webhooks for delivery status." },
		],
	},
	rails: {
		accent: "rose",
		install: "gem install reloop-email",
		language: "Ruby",
		code: `class UserMailer < ApplicationMailer
  def welcome(user)
    mail(to: user.email, subject: "Welcome")
  end
end`,
		steps: [
			{
				title: "Action Mailer",
				body: "Configure SMTP settings in production.rb.",
			},
			{
				title: "Background jobs",
				body: "Deliver later with Sidekiq or Solid Queue.",
			},
			{ title: "Devise emails", body: "Route password resets through Reloop." },
		],
	},
	"spring-boot": {
		accent: "orange",
		install: "sh.reloop:reloop-email",
		language: "Java",
		code: `@Service
class MailService {
  void sendReceipt(Order order) {
    reloop.emails().send(buildReceipt(order));
  }
}`,
		steps: [
			{
				title: "Add dependency",
				body: "Maven/Gradle dependency for reloop-email.",
			},
			{ title: "Inject client", body: "Configure bean with API key from env." },
			{ title: "Send async", body: "@Async mail for non-blocking requests." },
		],
	},
	supabase: {
		accent: "emerald",
		install: "Reloop SMTP in Supabase Auth",
		language: "Edge Functions",
		code: `// supabase/functions/send-email/index.ts
await fetch("https://api.reloop.dev/v1/emails", {
  method: "POST",
  headers: { Authorization: \`Bearer \${RELOOP_KEY}\` },
  body: JSON.stringify({ to, subject, html }),
});`,
		steps: [
			{
				title: "Custom SMTP",
				body: "Brand Supabase auth emails via Reloop SMTP.",
			},
			{ title: "Edge Functions", body: "Send app emails from Deno functions." },
			{
				title: "Sync status",
				body: "Store delivery events in Supabase tables.",
			},
		],
	},
	vercel: {
		accent: "slate",
		install: "npm install reloop-email",
		language: "Serverless",
		code: `// Works on Vercel Edge + Node runtimes
export const runtime = "nodejs"; // recommended for SDK`,
		steps: [
			{
				title: "Env vars",
				body: "Add RELOOP_API_KEY in Vercel project settings.",
			},
			{
				title: "Serverless sends",
				body: "Send from API routes without managing SMTP.",
			},
			{
				title: "Preview deploys",
				body: "Use sandbox keys on preview branches.",
			},
		],
	},
	"stripe-webhooks": {
		accent: "violet",
		install: "Stripe webhook + Reloop API",
		language: "Billing",
		code: `if (event.type === "invoice.paid") {
  await reloop.emails.send({
    to: customer.email,
    subject: "Receipt",
    html: renderInvoice(event.data.object),
  });
}`,
		steps: [
			{
				title: "Listen for events",
				body: "Handle invoice.paid and payment_intent.succeeded.",
			},
			{
				title: "Render receipt",
				body: "Map Stripe line items to your template.",
			},
			{ title: "Retry safely", body: "Idempotent sends on webhook retries." },
		],
	},
};

export function getIntegrationEnrichment(slug: string): IntegrationEnrichment {
	return (
		integrationEnrichment[slug] ?? {
			accent: "blue",
			install: "See documentation",
			language: "API",
			code: "await reloop.emails.send({ to, subject, html });",
			steps: [
				{ title: "Get API key", body: "Sign up at Reloop dashboard." },
				{ title: "Install SDK", body: "Use the HTTP API or official SDK." },
				{ title: "Send", body: "Trigger your first email." },
			],
		}
	);
}
