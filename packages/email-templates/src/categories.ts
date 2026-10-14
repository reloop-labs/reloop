/**
 * Explore folders, in display order. A folder with no templates yet stays
 * hidden, so new ones can be listed here before they're filled.
 */
export const templateCategories = [
	{
		id: "onboarding",
		name: "Onboarding & welcome",
		description: "Welcome emails and getting-started sequences.",
	},
	{
		id: "auth",
		name: "Auth & security",
		description: "Sign-in codes, password resets, verification, and alerts.",
	},
	{
		id: "account",
		name: "Account & settings",
		description: "Changes to a user's email, profile, or account.",
	},
	{
		id: "billing",
		name: "Billing & subscriptions",
		description:
			"Trials, renewals, plan changes, invoices, and failed payments.",
	},
	{
		id: "usage",
		name: "Usage & limits",
		description: "Heads-ups before and after a plan limit is reached.",
	},
	{
		id: "team",
		name: "Team & collaboration",
		description: "Invites, new members, and workspace access.",
	},
	{
		id: "notifications",
		name: "Notifications & digests",
		description: "Mentions, activity, and scheduled reports.",
	},
	{
		id: "offers",
		name: "Offers & promotions",
		description: "Discounts, upgrades, sales, and trial extensions.",
	},
	{
		id: "win-back",
		name: "Win-back & retention",
		description: "Bring back customers who churned or went quiet.",
	},
	{
		id: "developer",
		name: "AI & developer tools",
		description: "API keys, domains, and developer setup.",
	},
	{
		id: "orders",
		name: "Orders & shipping",
		description: "Order confirmations, shipping updates, and deliveries.",
	},
	{
		id: "receipts",
		name: "Receipts & refunds",
		description: "Payment receipts and refund confirmations.",
	},
	{
		id: "cart-recovery",
		name: "Cart & checkout recovery",
		description: "Abandoned cart and unfinished checkout reminders.",
	},
	{
		id: "reviews",
		name: "Reviews & feedback",
		description: "Review requests and product feedback.",
	},
	{
		id: "bookings",
		name: "Bookings & appointments",
		description: "Booking confirmations, reminders, and reschedules.",
	},
	{
		id: "events",
		name: "Events & tickets",
		description: "Tickets, registrations, and event reminders.",
	},
	{
		id: "newsletters",
		name: "Newsletters & announcements",
		description: "Product updates, launches, and newsletters.",
	},
	{
		id: "surveys",
		name: "Surveys & NPS",
		description: "NPS, satisfaction, and research surveys.",
	},
	{
		id: "support",
		name: "Support & tickets",
		description: "Support request receipts and replies.",
	},
	{
		id: "status",
		name: "Status & incidents",
		description: "Outages, incidents, and scheduled maintenance.",
	},
	{
		id: "legal",
		name: "Legal & policy updates",
		description: "Terms, privacy policy, and compliance notices.",
	},
	{
		id: "data",
		name: "Data & exports",
		description: "Exports and file downloads that are ready.",
	},
] as const;

export type TemplateCategory = (typeof templateCategories)[number];
export type TemplateCategoryId = TemplateCategory["id"];
