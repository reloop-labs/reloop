import {
	acme,
	acmeEmail,
	block,
	button,
	code,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Article teaser: small gray kicker, linked title, one-line summary. */
function article(
	kicker: string,
	href: string,
	title: string,
	summary: string,
	marginBottom = 0,
) {
	return block(
		`<p style="margin:0 0 6px 0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${acme.font}">${kicker}</p>
<p style="margin:0 0 6px 0;font-size:18px;line-height:26px;font-weight:500;color:${acme.ink};font-family:${acme.font}"><a href="${href}" target="_blank" style="color:${acme.ink};text-decoration:none">${title}</a></p>
<p style="margin:0;font-size:15px;line-height:24px;color:${acme.body};font-family:${acme.font}">${summary}</p>`,
		`padding:20px 0;border-bottom:1px solid ${acme.line}`,
		`margin:0 0 ${marginBottom}px 0`,
	);
}

/** Tinted pull quote with attribution. */
function quote(html: string, attribution: string) {
	return block(
		`<p style="margin:0 0 12px 0;font-size:17px;line-height:27px;color:${acme.ink};font-family:${acme.font}">${html}</p>
<p style="margin:0;font-size:14px;line-height:22px;color:${acme.muted};font-family:${acme.font}">${attribution}</p>`,
		`padding:20px 24px;border-left:3px solid ${acme.brand}`,
		`background-color:${acme.tint};margin:0 0 28px 0`,
	);
}

/** Big centered stat for the year in review. */
function stat(value: string, label: string, marginBottom = 12) {
	return block(
		`<p style="margin:0;font-size:44px;line-height:50px;font-weight:600;letter-spacing:-0.03em;color:${acme.ink};text-align:center;font-family:${acme.font}">${value}</p>
<p style="margin:6px 0 0 0;font-size:15px;line-height:24px;color:${acme.body};text-align:center;font-family:${acme.font}">${label}</p>`,
		`padding:28px 24px;background-color:${acme.tint};border-radius:12px`,
		`margin:0 0 ${marginBottom}px 0`,
	);
}

function productUpdateHtml(origin: string): string {
	return acmeEmail({
		title: "What's new in Acme: October",
		preview: "Saved views, faster exports, and a new CLI command.",
		body: `${logo(origin)}
${eyebrow("Product update · October 2026")}
${heading("What's new in Acme")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here's what we shipped this month. Most of it came straight from your feedback.`, 32)}
${step(1, "Saved views", "Save any combination of filters, date range, and breakdown, then share it with your workspace in one click.")}
${step(2, "Exports up to 10x faster", "CSV and Parquet exports now stream in the background, so large date ranges finish in seconds instead of minutes.")}
${step(3, "acme events tail", "A new CLI command that streams live events to your terminal. Handy for checking a deploy or a new custom event.")}
${step(4, "Smaller fixes", "Timezone handling in weekly reports, clearer error messages in the MCP server, and 23 other fixes.")}
${text(`Want every detail? Read the full ${link("{{{changelog_url}}}", "changelog")}.`, { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Try saved views")}
${text("You're receiving this because you subscribed to Acme product updates.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function featureLaunchHtml(origin: string): string {
	return acmeEmail({
		title: "Introducing funnels in Acme",
		preview: "See exactly where visitors drop off between landing and signup.",
		body: `${logo(origin)}
${eyebrow("New in Acme")}
${heading("Introducing funnels")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you can now see exactly where visitors drop off on the way to a signup, a purchase, or any custom event.`)}
${text("Pick up to eight steps, from a page view to a button click to a completed checkout. Acme shows the conversion rate between each step and how long people take to move through them.")}
${text("Funnels work with the data you already collect. There's nothing new to install, and your last 12 months of events are included from day one.", { marginBottom: 28 })}
${details([
	{ label: "Available on", value: "All paid plans" },
	{ label: "Steps per funnel", value: "Up to 8" },
	{ label: "History", value: "Last 12 months" },
])}
${button("{{{feature_url}}}", "Build your first funnel")}
${text(`Prefer your terminal? Run ${link("{{{docs_url}}}", "acme funnels create")} or ask the MCP server to build one for you.`, { marginBottom: 24 })}
${fallback("{{{feature_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function launchWeekHtml(origin: string): string {
	return acmeEmail({
		title: "Acme launch week starts Monday",
		preview: "Five days, five launches. Here's what to expect.",
		body: `${logo(origin)}
${heading("Launch week starts Monday")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, starting <span data-variable="launch_date">{{{launch_date}}}</span> we're shipping something new every day for a week. This is the biggest release in Acme's history.`)}
${details([
	{ label: "Monday", value: "A new dashboard" },
	{ label: "Tuesday", value: "Session replays" },
	{ label: "Wednesday", value: "MCP server 2.0" },
	{ label: "Thursday", value: "Warehouse sync" },
	{ label: "Friday", value: "One more thing" },
])}
${text("Each launch goes live at 9am Pacific with a short demo, the docs, and a post from the team that built it. Everything ships to every plan unless we say otherwise.", { marginBottom: 28 })}
${button("{{{launch_url}}}", "Follow launch week")}
${text("We'll send one short recap on Friday instead of an email every day.", { marginBottom: 24 })}
${fallback("{{{launch_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function companyNewsHtml(origin: string): string {
	return acmeEmail({
		title: "Acme raised a Series A",
		preview: "What our $24M Series A means for you and your data.",
		body: `${logo(origin)}
${heading("We raised a Series A")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, today we're sharing that Acme has raised $24M led by Northfield Ventures. We wanted you to hear it from us first.`)}
${text("When we started Acme, we wanted analytics that respected visitors and still told teams what they needed to know. More than 9,000 workspaces later, that's still the plan.")}
${text("Here's what the funding means for you:", { marginBottom: 12, color: acme.ink })}
${step(1, "Same product, same pricing", "Nothing about your plan or your data changes. We're not adding ads or selling data, ever.")}
${step(2, "A bigger team", "We're doubling engineering and support, so features ship faster and replies come sooner.")}
${step(3, "Data stays in your region", "We're opening EU and APAC data centers early next year.")}
${text(`Thank you for building with us. You can read the full announcement ${link("{{{announcement_url}}}", "on our blog")}.`, { marginBottom: 28 })}
${text("Jordan Lee<br />Co-founder and CEO", { marginBottom: 32, color: acme.ink })}
${footer({ unsubscribe: true })}`,
	});
}

function monthlyDigestHtml(origin: string): string {
	return acmeEmail({
		title: "The Acme Monthly: October",
		preview:
			"Attribution without cookies, UTM hygiene, and a look at bounce rate.",
		body: `${logo(origin)}
${eyebrow("The Acme Monthly · Issue 18")}
${heading("Three reads for October")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here are the pieces our readers found most useful this month.`, 8)}
${article("Guide · 8 min read", "{{{article_one_url}}}", "Attribution without cookies", "How to understand which channels drive signups when you can't follow visitors across sessions.")}
${article("Playbook · 5 min read", "{{{article_two_url}}}", "A UTM naming scheme your team will actually use", "Five rules that keep campaign reports clean, plus a template you can copy.")}
${article("Opinion · 4 min read", "{{{article_three_url}}}", "Stop worrying about bounce rate", "Why engagement time and scroll depth tell you more, and how to set them up in Acme.", 32)}
${button("{{{blog_url}}}", "Read more on the blog")}
${text("Have a topic you'd like us to cover? Reply to this email and tell us.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function tipsHtml(origin: string): string {
	return acmeEmail({
		title: "5 ways to get more out of Acme",
		preview: "Small settings that make your reports a lot more useful.",
		body: `${logo(origin)}
${heading("5 ways to get more out of Acme")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, these are the settings we see the most effective teams turn on in their first month.`, 32)}
${step(1, "Filter out your own traffic", "Add your office IPs or use the browser toggle so internal visits don't skew your numbers.")}
${step(2, "Track the actions that matter", "Custom events for signups and purchases turn page views into conversion rates.")}
${step(3, "Set a goal on your top page", "Goals show up on every report, so you can see which sources actually convert.")}
${step(4, "Schedule a weekly report", "Send a summary to Slack or email every Monday so the whole team stays in the loop.")}
${step(5, "Ask the MCP server", 'Connect Acme to your AI assistant and ask questions like "what changed on the pricing page this week?"')}
${code(["npx acme events add signup --goal"])}
${button("{{{dashboard_url}}}", "Open your workspace")}
${footer({ unsubscribe: true })}`,
	});
}

function customerStoryHtml(origin: string): string {
	return acmeEmail({
		title: "How Fieldnote cut reporting time by 70%",
		preview: "A four-person growth team replaced three tools with Acme.",
		body: `${logo(origin)}
${eyebrow("Customer story")}
${heading("How Fieldnote cut reporting time by 70%")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, Fieldnote is a note-taking app with 400,000 users and a growth team of four. Here's how they moved their analytics to Acme in a single afternoon.`)}
${quote("We used to spend Monday mornings stitching together three dashboards. Now the weekly report lands in Slack and we spend that time on experiments.", "Priya Raman, Head of Growth at Fieldnote")}
${details([
	{ label: "Time spent on reporting", value: "-70%" },
	{ label: "Tools replaced", value: "3" },
	{ label: "Signup conversion", value: "+18%", strong: true },
])}
${text("The biggest win was funnels. Within a week the team found that most trial signups stalled on the workspace invite step, and a small copy change lifted conversion by 18%.", { marginBottom: 28 })}
${button("{{{story_url}}}", "Read the full story")}
${footer({ unsubscribe: true })}`,
	});
}

function webinarHtml(origin: string): string {
	return acmeEmail({
		title: "Live: building dashboards with the Acme MCP server",
		preview: "A 45-minute walkthrough with the team that built it.",
		body: `${logo(origin)}
${eyebrow("Live webinar")}
${heading("Building dashboards with the Acme MCP server")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, join us for a 45-minute walkthrough of how teams use AI assistants to answer analytics questions and build reports.`)}
${details([
	{
		label: "Date",
		value: `<span data-variable="webinar_date">{{{webinar_date}}}</span>`,
	},
	{ label: "Time", value: "10:00am PT / 6:00pm GMT" },
	{ label: "Hosts", value: "Sam Ortiz and Lena Park" },
	{ label: "Length", value: "45 minutes plus Q&amp;A" },
])}
${text("We'll cover:", { marginBottom: 12, color: acme.ink })}
${text("Connecting the MCP server to Claude, Cursor, and ChatGPT<br />Prompts that turn into reusable saved views<br />Keeping workspace permissions intact for every teammate", { marginBottom: 28 })}
${button("{{{register_url}}}", "Save my seat")}
${text("Can't make it live? Register anyway and we'll send you the recording.", { marginBottom: 24 })}
${fallback("{{{register_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function pricingChangeHtml(origin: string): string {
	return acmeEmail({
		title: "Upcoming changes to Acme pricing",
		preview: "Your price stays the same until your renewal after Jan 1, 2027.",
		body: `${logo(origin)}
${heading("Upcoming changes to our pricing")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we're updating Acme's plans on <span data-variable="effective_date">{{{effective_date}}}</span>. We wanted to give you plenty of notice and explain exactly what changes for you.`)}
${details([
	{
		label: "Your plan",
		value: `<span data-variable="plan_name">{{{plan_name}}}</span>`,
	},
	{ label: "Current price", value: "$48 / month" },
	{
		label: "New price",
		value: "$54 / month",
		note: "Includes 250,000 more events and session replays",
		strong: true,
	},
])}
${text("Over the past two years we've added funnels, the MCP server, and warehouse sync without changing our prices. The new plans include higher event limits and replays, which used to be a paid add-on.")}
${text("Nothing changes before your first renewal after the effective date. If you switch to yearly billing before then, you keep today's price for another 12 months.", { marginBottom: 28 })}
${button("{{{pricing_url}}}", "Compare plans")}
${text("Questions about your account? Reply to this email and we'll help.", { marginBottom: 24 })}
${fallback("{{{pricing_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function yearInReviewHtml(origin: string): string {
	return acmeEmail({
		title: "Your 2026 in Acme",
		preview: "A look back at your workspace's year in numbers.",
		body: `${logo(origin)}
${eyebrow("Year in review")}
${heading("Your 2026 in Acme")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here's a look back at the year for <span data-variable="workspace_name">{{{workspace_name}}}</span>.`)}
${stat(`<span data-variable="total_visitors">{{{total_visitors}}}</span>`, "visitors measured")}
${stat(`<span data-variable="total_events">{{{total_events}}}</span>`, "custom events tracked")}
${stat(`<span data-variable="best_month">{{{best_month}}}</span>`, "your busiest month", 32)}
${text("Across Acme this year we shipped funnels, saved views, the MCP server, and 140 smaller improvements. Thank you for being part of it.", { marginBottom: 28 })}
${button("{{{review_url}}}", "See your full year")}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;

export const newslettersTemplates: EmailTemplateExample[] = [
	{
		id: "acme-newsletter-product-update",
		name: "Monthly product update",
		slug: "acme-newsletter-product-update",
		category: "newsletters",
		description: "Acme monthly changelog with a numbered list of what shipped.",
		html: productUpdateHtml,
		variables: [
			firstName,
			{ name: "changelog_url", type: "string", defaultValue: null },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-feature-launch",
		name: "New feature launch",
		slug: "acme-newsletter-feature-launch",
		category: "newsletters",
		description: "Acme announcement introducing a single new feature.",
		html: featureLaunchHtml,
		variables: [
			firstName,
			{ name: "feature_url", type: "string", defaultValue: null },
			{ name: "docs_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-launch-week",
		name: "Launch week",
		slug: "acme-newsletter-launch-week",
		category: "newsletters",
		description: "Acme teaser for a week of daily launches with the schedule.",
		html: launchWeekHtml,
		variables: [
			firstName,
			{ name: "launch_date", type: "string", defaultValue: "Oct 26, 2026" },
			{ name: "launch_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-company-news",
		name: "Company news",
		slug: "acme-newsletter-company-news",
		category: "newsletters",
		description:
			"Acme founder letter announcing a funding round and what it means for customers.",
		html: companyNewsHtml,
		variables: [
			firstName,
			{ name: "announcement_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-monthly-digest",
		name: "Monthly newsletter",
		slug: "acme-newsletter-monthly-digest",
		category: "newsletters",
		description: "Acme monthly newsletter featuring three articles.",
		html: monthlyDigestHtml,
		variables: [
			firstName,
			{ name: "article_one_url", type: "string", defaultValue: null },
			{ name: "article_two_url", type: "string", defaultValue: null },
			{ name: "article_three_url", type: "string", defaultValue: null },
			{ name: "blog_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-tips",
		name: "Tips & best practices",
		slug: "acme-newsletter-tips",
		category: "newsletters",
		description: "Acme roundup of five settings that make reports more useful.",
		html: tipsHtml,
		variables: [
			firstName,
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-customer-story",
		name: "Customer story",
		slug: "acme-newsletter-customer-story",
		category: "newsletters",
		description:
			"Acme case study with a customer quote and the results they saw.",
		html: customerStoryHtml,
		variables: [
			firstName,
			{ name: "story_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-webinar",
		name: "Webinar invite",
		slug: "acme-newsletter-webinar",
		category: "newsletters",
		description:
			"Acme invitation to a live webinar with date, hosts, and agenda.",
		html: webinarHtml,
		variables: [
			firstName,
			{ name: "webinar_date", type: "string", defaultValue: "Nov 5, 2026" },
			{ name: "register_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-pricing-change",
		name: "Pricing change notice",
		slug: "acme-newsletter-pricing-change",
		category: "newsletters",
		description:
			"Acme advance notice of a price change with the old and new price.",
		html: pricingChangeHtml,
		variables: [
			firstName,
			{ name: "effective_date", type: "string", defaultValue: "Jan 1, 2027" },
			{ name: "plan_name", type: "string", defaultValue: "Pro" },
			{ name: "pricing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-newsletter-year-in-review",
		name: "Year in review",
		slug: "acme-newsletter-year-in-review",
		category: "newsletters",
		description:
			"Acme personalized recap of a workspace's year in big numbers.",
		html: yearInReviewHtml,
		variables: [
			firstName,
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "total_visitors", type: "string", defaultValue: "1.2M" },
			{ name: "total_events", type: "string", defaultValue: "384,920" },
			{ name: "best_month", type: "string", defaultValue: "September" },
			{ name: "review_url", type: "string", defaultValue: null },
		],
	},
];
