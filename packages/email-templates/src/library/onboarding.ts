import {
	acme,
	acmeEmail,
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
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function finishSetupHtml(origin: string): string {
	return acmeEmail({
		title: "Finish setting up Acme",
		preview: "You're two steps away from seeing your first visitors.",
		body: `${logo(origin)}
${heading("You're two steps away")}
${lead(`Hi ${v("first_name")}, you started setting up ${v("workspace_name")} but haven't finished yet. Here's what's left before your first visitors show up.`, 32)}
${step(1, `<span style="color:${acme.muted};text-decoration:line-through">Create your workspace</span>`, "Done. Nice work.")}
${step(2, "Add your website", "Enter your domain so Acme knows which traffic belongs to you.")}
${step(3, "Install the tracking script", "Paste one line into your site's head, or use our WordPress, Shopify, or Next.js integration.")}
${button("{{{setup_url}}}", "Finish setup")}
${text("Most people are done in under five minutes. Your progress is saved, so you can pick up right where you left off.", { marginBottom: 24 })}
${fallback("{{{setup_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function firstMilestoneHtml(origin: string): string {
	return acmeEmail({
		title: "You just passed 1,000 visitors",
		preview: "Your site reached its first 1,000 visitors on Acme.",
		body: `${logo(origin)}
${eyebrow("Milestone")}
${heading("You just passed 1,000 visitors")}
${lead(`Congratulations, ${v("first_name")}. ${v("website_name")} reached its first 1,000 visitors since you installed Acme on ${v("install_date")}.`)}
${offer({ amount: "1,000", label: "visitors and counting" })}
${details([
	{ label: "Top source", value: "Google Search" },
	{ label: "Most viewed page", value: "/pricing" },
	{ label: "Busiest day", value: "Tuesday" },
])}
${button("{{{dashboard_url}}}", "See what's working")}
${text("Next up: add a custom event for signups so you can see which sources bring people who stick around.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function noDataYetHtml(origin: string): string {
	return acmeEmail({
		title: "We haven't seen any visits yet",
		preview:
			"Your tracking script might not be installed. Here's how to check.",
		body: `${logo(origin)}
${heading("We haven't seen any visits yet")}
${lead(`Hi ${v("first_name")}, it's been three days since you added ${v("website_name")}, and Acme hasn't received any events. Usually that means the script isn't on the page yet.`)}
${text("Check that this snippet is inside the &lt;head&gt; of every page:", { marginBottom: 12 })}
${code(['<script defer src="https://cdn.acme.example/script.js"', '  data-site="{{{site_id}}}"></script>'])}
${text(`Using an ad blocker? It can hide your own visits. Try a private window, or follow our ${link("#", "troubleshooting guide")}.`, { marginBottom: 28 })}
${button("{{{install_url}}}", "Check my installation")}
${text("Still stuck? Reply to this email and we'll take a look with you.", { marginBottom: 24 })}
${fallback("{{{install_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function founderNoteHtml(origin: string): string {
	return acmeEmail({
		title: "A quick note from Acme's founder",
		preview: "Why we built Acme, and one question for you.",
		body: `${logo(origin)}
${text(`Hi ${v("first_name")},`, { size: 16 })}
${text("I'm Sam, one of the people who started Acme. I wanted to say thanks for signing up, personally.", { size: 16 })}
${text("We built Acme because we were tired of analytics tools that took a week to set up and still couldn't answer simple questions. Our goal is that you can open Acme and know what's working in under a minute.", { size: 16 })}
${text("I have one question for you: what made you try Acme? Just hit reply. I read every answer, and they shape what we build next.", { size: 16, marginBottom: 28 })}
${text(`Sam Rivera<br /><span style="color:${acme.muted}">Co-founder, Acme</span>`, { color: acme.ink, size: 16, marginBottom: 32 })}
${button("{{{dashboard_url}}}", "Open your dashboard")}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function onboardingCallHtml(origin: string): string {
	return acmeEmail({
		title: "Book a free setup call",
		preview: "30 minutes with our team to get your dashboards right.",
		body: `${logo(origin)}
${heading("Book a free setup call")}
${lead(`Hi ${v("first_name")}, want a hand getting ${v("workspace_name")} set up? Grab 30 minutes with someone from our team and we'll walk through it together.`)}
${details([
	{ label: "Length", value: "30 minutes" },
	{ label: "Format", value: "Video call" },
	{ label: "Cost", value: "Free" },
])}
${text("We'll help you:", { color: acme.ink, marginBottom: 8 })}
${text("Verify your tracking is working<br />Set up custom events for signups and purchases<br />Build a dashboard your team will actually use", { marginBottom: 28 })}
${button("{{{booking_url}}}", "Pick a time")}
${text("Not ready yet? No problem. This offer stays open for your first 30 days.", { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

export const onboardingTemplates: EmailTemplateExample[] = [
	{
		id: "acme-onboarding-finish-setup",
		name: "Finish setup",
		slug: "acme-onboarding-finish-setup",
		category: "onboarding",
		description:
			"Acme nudge for a new user who started setup but hasn't added a website yet.",
		html: finishSetupHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "setup_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-onboarding-first-milestone",
		name: "First milestone",
		slug: "acme-onboarding-first-milestone",
		category: "onboarding",
		description:
			"Acme celebration when a new site reaches its first 1,000 visitors.",
		html: firstMilestoneHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acmestudio.com" },
			{ name: "install_date", type: "string", defaultValue: "Oct 2, 2026" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-onboarding-no-data-yet",
		name: "No data yet",
		slug: "acme-onboarding-no-data-yet",
		category: "onboarding",
		description:
			"Acme check-in three days after signup when no events have arrived yet.",
		html: noDataYetHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acmestudio.com" },
			{ name: "site_id", type: "string", defaultValue: "site_8f3k2m" },
			{ name: "install_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-onboarding-founder-note",
		name: "Founder note",
		slug: "acme-onboarding-founder-note",
		category: "onboarding",
		description:
			"Plain personal note from Acme's founder asking new users why they signed up.",
		html: founderNoteHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-onboarding-setup-call",
		name: "Setup call invite",
		slug: "acme-onboarding-setup-call",
		category: "onboarding",
		description:
			"Acme invitation to book a free 30-minute onboarding call with the team.",
		html: onboardingCallHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "booking_url", type: "string", defaultValue: null },
		],
	},
];
