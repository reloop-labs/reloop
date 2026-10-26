/**
 * One-line definitions shown on hover for compare table rows. They say what a
 * feature is, not how either product scores; the cells carry the comparison.
 * Keys are lowercase row labels.
 */
const FEATURE_HINTS: Record<string, string> = {
	// Sending
	"rest api": "Send email and manage resources over HTTPS with an API key.",
	"transactional api":
		"An HTTP endpoint for one-to-one messages your app triggers, like receipts and password resets.",
	"transactional rest api":
		"An HTTP endpoint for one-to-one messages your app triggers, like receipts and password resets.",
	"transactional sending api":
		"An HTTP endpoint for one-to-one messages your app triggers, like receipts and password resets.",
	"transactional api and smtp":
		"Send app-triggered email over HTTPS or by pointing any SMTP client at the provider.",
	"rest api and smtp":
		"Send over HTTPS or by pointing any SMTP client at the provider.",
	"smtp relay":
		"Send through standard SMTP credentials, so tools that only speak SMTP work without code changes.",
	"smtp submission":
		"Accepts mail from SMTP clients on the standard submission ports with authentication.",
	"official sdks":
		"Maintained client libraries that wrap the API for your language.",
	"react email / html templates":
		"Send email built from React components or plain HTML.",
	"react email": "Write email as React components and render them to HTML.",
	"batch / broadcast sending":
		"Send one message to many recipients in a single request or campaign.",
	"scheduled delivery": "Queue a message now and have it sent at a set time.",
	"sending path":
		"The infrastructure a message actually leaves through on its way to the inbox.",
	"sending engine":
		"The mail transfer agent (MTA) that delivers your messages.",
	"sends mail itself":
		"Whether the provider runs its own mail servers or hands mail to another service.",
	"direct mta control":
		"Control over the mail server that delivers your email, like queues, retries and IP pools.",
	"direct mta delivery (no ses hop)":
		"Mail goes from the provider's own servers to the inbox, without passing through Amazon SES.",
	mta: "The mail transfer agent: the server software that delivers email to receiving mail servers.",
	"open-source mta engine":
		"The mail server that delivers your email is open source and can be inspected or self-hosted.",
	"traffic separation":
		"Keeping transactional and marketing mail on separate streams or IPs so one can't hurt the other's reputation.",
	"testing sandbox":
		"A safe mode that captures test sends instead of delivering them to real inboxes.",

	// Receiving and inboxes
	"agent inbox":
		"A mailbox your AI agents can read and reply from through the API, MCP or IMAP.",
	"agent / ai inbox":
		"A mailbox your AI agents can read and reply from through the API, MCP or IMAP.",
	"agent / ai inbox product":
		"A mailbox your AI agents can read and reply from through the API, MCP or IMAP.",
	"agent / ai inbound inbox":
		"A mailbox your AI agents can read and reply from through the API, MCP or IMAP.",
	"inbox for humans":
		"A shared web inbox where your team reads and answers email sent to your domains.",
	"inbound email":
		"Receive email at your own domain and get it into your app or an inbox.",
	"inbound email / agent inbox":
		"Receive email at your own domain, stored as threads people and AI agents can work from.",
	"inbound / reply handling":
		"Receive replies and other inbound mail and route them to your app.",
	"threads and reply in thread":
		"Messages are grouped into conversations, and replies stay in the same thread.",
	"inbound spam scoring":
		"Incoming mail is scored for spam before it reaches your app or inbox.",
	"ai composer": "Draft and edit emails with an AI writing assistant.",

	// Templates
	templates: "Reusable email designs you fill with data at send time.",
	"stored templates":
		"Templates saved with the provider and referenced by ID when you send.",
	"template management":
		"Create, version and edit templates in the dashboard or over the API.",
	"template language":
		"The syntax used to insert variables and logic into templates.",
	"template logic": "Conditions and loops inside templates.",
	"drag-and-drop editor": "Build emails visually without writing HTML.",

	// Marketing
	"marketing campaigns":
		"One-to-many emails to a list or segment, like announcements and newsletters.",
	"marketing email":
		"One-to-many emails to a list or segment, like announcements and newsletters.",
	"campaigns / newsletters":
		"One-to-many emails to a list or segment, like announcements and newsletters.",
	"broadcast / marketing newsletters":
		"One-to-many emails to a list or segment, like announcements and newsletters.",
	"lifecycle & onboarding campaigns":
		"Automated sequences that follow a user from signup onward.",
	automations: "Emails sent automatically when an event or condition is met.",
	"event-triggered automations":
		"Sequences that start when your app reports an event, like a signup or a purchase.",
	"campaigns and automations":
		"Broadcast campaigns plus automated sequences triggered by events.",
	"contacts, campaigns, automations":
		"A contact list, broadcast campaigns and event-triggered sequences in one place.",
	"contacts / audiences":
		"Stored lists of recipients with their properties and subscription status.",
	segmentation:
		"Target a subset of contacts based on their properties or behaviour.",
	"a/b testing": "Send variants of an email and compare how each performs.",
	sms: "Text messages sent from the same account as your email.",
	"sms and whatsapp": "Text and WhatsApp messages sent from the same account.",
	"sms / whatsapp in the same account":
		"Text and WhatsApp messages sent from the same account as your email.",

	// Events and analytics
	webhooks:
		"HTTP callbacks to your app when something happens, like a delivery, bounce or open.",
	"webhook signing":
		"Each webhook is signed so your app can check it really came from the provider.",
	"webhook signature verification":
		"Each webhook is signed so your app can check it really came from the provider.",
	"webhook management api": "Create and update webhook endpoints over the API.",
	"real-time events": "Delivery, bounce and engagement events as they happen.",
	"delivery events":
		"Events that tell you each message was accepted, delivered or deferred.",
	"bounce handling":
		"Failed deliveries are recorded and bad addresses are stopped from being mailed again.",
	"bounce & complaint handling":
		"Bounces and spam complaints are recorded and those addresses are suppressed.",
	"complaint / spam events":
		"Events when a recipient marks your email as spam.",
	"unsubscribe events": "Events when a recipient opts out of your email.",
	"suppression lists":
		"Addresses that bounced, complained or unsubscribed, kept out of future sends.",
	"open tracking": "Records when a recipient opens an email.",
	"click tracking": "Records when a recipient clicks a link in an email.",
	"open & click tracking":
		"Records when recipients open emails and click links.",
	"geolocation on opens":
		"The approximate location of the device that opened an email.",
	"email client analytics":
		"Which mail apps and devices your recipients read your email in.",
	"dashboard activity / logs":
		"A searchable record of every message and its events in the dashboard.",
	"log retention": "How long message logs and events are kept.",
	"email validation":
		"Checks whether an address is likely to receive mail before you send to it.",

	// Deliverability and security
	"dedicated ip":
		"A sending IP address used only by you, so your reputation is your own.",
	"dedicated ips":
		"Sending IP addresses used only by you, so your reputation is your own.",
	"shared ips":
		"Sending IP addresses shared with other senders, with a pooled reputation.",
	"single sender reputation pool":
		"Whether your mail shares IP reputation with other customers' mail.",
	spf: "A DNS record listing the servers allowed to send email for your domain.",
	dkim: "A cryptographic signature that proves an email came from your domain and wasn't altered.",
	"spf / dkim / dmarc":
		"The DNS records that prove your mail is really from your domain and tell receivers what to do if it isn't.",
	"dmarc guidance / records":
		"Help setting up the DNS policy that tells receivers how to treat mail that fails SPF or DKIM.",
	"tls options":
		"Control over encryption when mail is handed to receiving servers.",
	"domain tls enforcement":
		"Require encrypted connections when delivering to specific domains.",
	"account auth": "How people sign in to the account, like SSO and two-factor.",
	"public status page": "A public page showing current uptime and incidents.",

	// Ownership and hosting
	"open source":
		"The source code is public and you can read, run and modify it.",
	"open-source":
		"The source code is public and you can read, run and modify it.",
	"open-source codebase":
		"The source code is public and you can read, run and modify it.",
	"open source / self-host":
		"The code is public and you can run the whole product on your own servers.",
	"self-host":
		"Run the product on your own servers instead of the vendor's cloud.",
	"self-hostable":
		"Run the product on your own servers instead of the vendor's cloud.",
	"self-hosted email sends":
		"How much email you can send when you run the product on your own servers.",
	"self-host needs": "What you have to run yourself to self-host.",
	"self-host needs aws": "Whether self-hosting depends on an AWS account.",
	"self-host = your uptime domain":
		"When you self-host, keeping the service up is your responsibility.",
	"hosted saas": "The vendor runs the service for you in their cloud.",
	"hosted option": "Whether the vendor offers a managed, hosted version.",
	"data export & sovereignty":
		"Getting your data out, and choosing where it is stored.",
	"where email data lives": "Where your messages and contacts are stored.",
	"vendor lock-in risk":
		"How hard it would be to move to another provider later.",

	// Pricing (only shown on pages without a separate price section)
	"free tier": "What you can send each month without paying.",
	"entry paid plan": "The cheapest paid plan and what it includes.",
	"paid pricing": "What the paid plans cost.",
	"pricing model":
		"What the bill is based on, like emails sent or contacts stored.",
	"pricing basis":
		"What the bill is based on, like emails sent or contacts stored.",
	overage: "What you pay for email beyond your plan's included volume.",
	"overage per 1,000":
		"What you pay for each extra 1,000 emails beyond your plan.",
	"extra volume": "What you pay for email beyond your plan's included volume.",
	"next plan": "The plan you move to once you outgrow the current one.",
	"what you get": "What the plan includes beyond sending email.",
	"10,000 emails / mo": "The cheapest plan that covers 10,000 emails a month.",
	"50,000 emails / mo": "The cheapest plan that covers 50,000 emails a month.",
	"100,000 emails / mo":
		"The cheapest plan that covers 100,000 emails a month.",
	"plan with automations": "The cheapest plan that includes automations.",
	"priced by":
		"What the bill is based on, like emails sent or contacts stored.",
	stack: "The main technologies the product is built on.",
	status:
		"Whether the product is generally available, in beta or being retired.",
};

/** The hover definition for a compare table row, if we have one. */
export function getFeatureHint(label: string): string | undefined {
	return FEATURE_HINTS[label.trim().toLowerCase()];
}
