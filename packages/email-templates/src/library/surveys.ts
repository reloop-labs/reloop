import {
	acme,
	acmeEmail,
	block,
	button,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/**
 * 0 to 10 scale as a row of bordered cells. Each number links to
 * `{{{survey_url}}}?score=N` so one click records the answer.
 */
function npsScale(href: string): string {
	const cells = Array.from({ length: 11 }, (_, n) => {
		const gap = n < 10 ? "padding:0 4px 0 0;" : "";
		return `<td style="${gap}width:9%"><a href="${href}?score=${n}" target="_blank" style="display:block;padding:10px 0;border:1px solid ${acme.line};border-radius:6px;text-align:center;text-decoration:none;font-size:15px;line-height:20px;font-weight:500;color:${acme.ink};font-family:${acme.font}">${n}</a></td>`;
	}).join("\n");
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px 0">
<tbody>
<tr>
${cells}
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px 0">
<tbody>
<tr>
<td><p style="margin:0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${acme.font}">Not likely</p></td>
<td style="text-align:right"><p style="margin:0;font-size:13px;line-height:20px;color:${acme.muted};text-align:right;font-family:${acme.font}">Very likely</p></td>
</tr>
</tbody>
</table>`;
}

/** Stacked full-width answer links, one per row. */
function choices(options: { href: string; label: string }[]): string {
	const rows = options
		.map(
			({ href, label }) => `<tr>
<td style="padding:0 0 10px 0"><a href="${href}" target="_blank" style="display:block;padding:14px 18px;border:1px solid ${acme.line};border-radius:8px;text-decoration:none;font-size:15px;line-height:22px;color:${acme.ink};font-family:${acme.font}">${label}</a></td>
</tr>`,
		)
		.join("\n");
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px 0">
<tbody>
${rows}
</tbody>
</table>`;
}

/** Side-by-side rating buttons with a word under each. */
function ratingRow(options: { href: string; mark: string; label: string }[]) {
	const width = Math.floor(100 / options.length);
	const cells = options
		.map(
			({ href, mark, label }, i) =>
				`<td style="${i < options.length - 1 ? "padding:0 8px 0 0;" : ""}width:${width}%"><a href="${href}" target="_blank" style="display:block;padding:18px 0;background-color:${acme.tint};border-radius:10px;text-align:center;text-decoration:none;font-family:${acme.font}"><span style="display:block;font-size:24px;line-height:30px;color:${acme.ink}">${mark}</span><span style="display:block;margin-top:4px;font-size:14px;line-height:20px;color:${acme.body}">${label}</span></a></td>`,
		)
		.join("\n");
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px 0">
<tbody>
<tr>
${cells}
</tr>
</tbody>
</table>`;
}

function npsHtml(origin: string): string {
	return acmeEmail({
		title: "How likely are you to recommend Acme?",
		preview: "One question, one click. It takes five seconds.",
		body: `${logo(origin)}
${heading("How likely are you to recommend Acme?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, on a scale from 0 to 10, how likely are you to recommend Acme to a friend or colleague?`)}
${npsScale("{{{survey_url}}}")}
${text("Click a number to answer. You'll have the option to tell us why on the next page, but that part is up to you.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function csatHtml(origin: string): string {
	return acmeEmail({
		title: "How did we do?",
		preview: "Rate your recent conversation with Acme support.",
		body: `${logo(origin)}
${heading("How did we do?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, <span data-variable="agent_name">{{{agent_name}}}</span> recently helped you with ticket #<span data-variable="ticket_id">{{{ticket_id}}}</span>. How was your experience?`)}
${ratingRow([
	{ href: "{{{rating_url}}}?rating=good", mark: "&#9786;", label: "Good" },
	{ href: "{{{rating_url}}}?rating=okay", mark: "&#8722;", label: "Okay" },
	{ href: "{{{rating_url}}}?rating=bad", mark: "&#9785;", label: "Bad" },
])}
${text("Your rating goes straight to our support lead and helps us coach the team. If something still isn't right, reply to this email and we'll reopen your ticket.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function onboardingHtml(origin: string): string {
	return acmeEmail({
		title: "How was getting started with Acme?",
		preview: "Three quick questions about your first two weeks.",
		body: `${logo(origin)}
${eyebrow("2 minute survey")}
${heading("How was getting started?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you've had Acme for two weeks now. We'd love to know what was easy and what got in your way.`)}
${text("We'll ask three things:", { marginBottom: 12, color: acme.ink })}
${step(1, "Setup", "How long it took to see your first visit, and where you got stuck.")}
${step(2, "Your first report", "Whether the dashboard answered the question you came with.")}
${step(3, "What's missing", "The one thing that would make Acme more useful for your team.")}
${button("{{{survey_url}}}", "Start the survey")}
${text("Every answer is read by our onboarding team. We use them to decide what to fix first.", { marginBottom: 24 })}
${fallback("{{{survey_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function cancellationHtml(origin: string): string {
	return acmeEmail({
		title: "Can you tell us why you canceled?",
		preview: "One click helps us make Acme better for the next team.",
		body: `${logo(origin)}
${heading("Can you tell us why you left?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we're sorry to see you go. Your workspace stays active until <span data-variable="end_date">{{{end_date}}}</span>. If you have a moment, what was the main reason you canceled?`)}
${choices([
	{ href: "{{{survey_url}}}?reason=price", label: "It's too expensive" },
	{
		href: "{{{survey_url}}}?reason=features",
		label: "Missing a feature I need",
	},
	{
		href: "{{{survey_url}}}?reason=switched",
		label: "Switched to another tool",
	},
	{ href: "{{{survey_url}}}?reason=usage", label: "Not using it enough" },
	{ href: "{{{survey_url}}}?reason=other", label: "Something else" },
])}
${text("One click is all it takes. We won't try to talk you out of it.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function productMarketFitHtml(origin: string): string {
	return acmeEmail({
		title: "How would you feel without Acme?",
		preview: "One honest question from the Acme team.",
		body: `${logo(origin)}
${heading("How would you feel if you could no longer use Acme?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we're asking a small group of active customers one question. There are no wrong answers, and honest ones help us most.`)}
${choices([
	{ href: "{{{survey_url}}}?answer=very", label: "Very disappointed" },
	{ href: "{{{survey_url}}}?answer=somewhat", label: "Somewhat disappointed" },
	{ href: "{{{survey_url}}}?answer=not", label: "Not disappointed" },
	{ href: "{{{survey_url}}}?answer=na", label: "I no longer use Acme" },
])}
${text("After you click, we'll ask what you'd use instead. That part is optional.", { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function featureVoteHtml(origin: string): string {
	return acmeEmail({
		title: "Help us pick what Acme builds next",
		preview: "Vote for the feature you want most. Voting closes Oct 31.",
		body: `${logo(origin)}
${eyebrow("Roadmap vote")}
${heading("What should we build next?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've narrowed next quarter's roadmap to four ideas. Vote for the one that would help your team most and we'll build the winner first.`)}
${choices([
	{
		href: "{{{vote_url}}}?feature=alerts",
		label:
			"<strong>Anomaly alerts</strong><br />Get notified when traffic or conversions change unexpectedly",
	},
	{
		href: "{{{vote_url}}}?feature=ab",
		label:
			"<strong>A/B test reports</strong><br />Compare variants with significance built in",
	},
	{
		href: "{{{vote_url}}}?feature=revenue",
		label:
			"<strong>Revenue attribution</strong><br />Connect Stripe and see revenue by source",
	},
	{
		href: "{{{vote_url}}}?feature=mobile",
		label:
			"<strong>Mobile SDK</strong><br />Track iOS and Android apps in the same workspace",
	},
])}
${text(`Voting closes <span data-variable="vote_deadline">{{{vote_deadline}}}</span>. We'll share the results and a rough timeline the week after.`, { marginBottom: 24 })}
${footer({ unsubscribe: true })}`,
	});
}

function researchInterviewHtml(origin: string): string {
	return acmeEmail({
		title: "Chat with the Acme product team?",
		preview: "30 minutes, a $100 gift card, and a direct line to our roadmap.",
		body: `${logo(origin)}
${heading("Can we learn from you?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, I'm Lena, a designer on the Acme team. We're redesigning how reports are shared, and I'd love to hear how your team does it today.`)}
${details([
	{ label: "Format", value: "Video call" },
	{ label: "Length", value: "30 minutes" },
	{ label: "When", value: "Any time before Oct 30" },
	{
		label: "Thank you",
		value: `<span data-variable="incentive">{{{incentive}}}</span>`,
		strong: true,
	},
])}
${text("There's nothing to prepare. We'll ask about your workflow, look at a few early sketches together, and you'll be one of the first to see what we build.", { marginBottom: 28 })}
${button("{{{booking_url}}}", "Pick a time")}
${text("Not a good time? No problem. Just ignore this email.", { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function annualSurveyHtml(origin: string): string {
	return acmeEmail({
		title: "The 2026 Acme customer survey",
		preview: "10 minutes to shape next year's roadmap.",
		body: `${logo(origin)}
${eyebrow("Annual customer survey")}
${heading("Help shape Acme in 2027")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, once a year we ask every customer how we're doing. Your answers decide what we focus on next year, from features to pricing to support.`)}
${details([
	{ label: "Time to complete", value: "About 10 minutes" },
	{ label: "Questions", value: "18" },
	{
		label: "Closes",
		value: `<span data-variable="close_date">{{{close_date}}}</span>`,
	},
])}
${text("As a thank you, everyone who finishes gets 3 months of extra event history added to their workspace.", { marginBottom: 28 })}
${button("{{{survey_url}}}", "Take the survey")}
${text("Responses are anonymous unless you choose to leave your email at the end.", { marginBottom: 24 })}
${fallback("{{{survey_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function surveyReminderHtml(origin: string): string {
	return acmeEmail({
		title: "Last chance to share your feedback",
		preview: "The Acme customer survey closes on Friday.",
		body: `${logo(origin)}
${heading("Last chance to share your feedback")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, a quick reminder that our customer survey closes on <span data-variable="close_date">{{{close_date}}}</span>. It takes about 10 minutes.`)}
${text("So far 2,140 customers have responded. We'd really like to hear from you too, especially if you've had a frustrating moment with Acme this year.", { marginBottom: 28 })}
${button("{{{survey_url}}}", "Finish the survey")}
${text("Already done? Thank you. You can ignore this email.", { marginBottom: 24 })}
${fallback("{{{survey_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function feedbackThanksHtml(origin: string): string {
	return acmeEmail({
		title: "You asked, we listened",
		preview: "Here's what we changed based on your survey answers.",
		body: `${logo(origin)}
${heading("You asked, we listened")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, thank you for taking our customer survey. More than 2,600 of you responded, and here's what we've changed since.`, 32)}
${block(
	`<p style="margin:0 0 4px 0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${acme.font}">The most common request</p>
<p style="margin:0;font-size:17px;line-height:26px;color:${acme.ink};font-family:${acme.font}">"Let me share a report with someone who doesn't have an Acme account."</p>`,
	`padding:20px 24px;background-color:${acme.tint};border-radius:10px`,
	"margin:0 0 28px 0",
)}
${step(1, "Public report links", "Share any saved view with a read-only link. You can set an expiry date or add a password.")}
${step(2, "Faster dashboard", "Pages with large date ranges now load in under a second, down from four.")}
${step(3, "Support on weekends", "Paid plans now get replies on Saturdays and Sundays too.")}
${text("A few requests, like the mobile SDK, are still in progress. We'll write when they ship.", { marginBottom: 28 })}
${button("{{{changes_url}}}", "See everything we changed")}
${footer({ unsubscribe: true })}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;

export const surveysTemplates: EmailTemplateExample[] = [
	{
		id: "acme-survey-nps",
		name: "NPS survey",
		slug: "acme-survey-nps",
		category: "surveys",
		description:
			"Acme Net Promoter Score question with a one-click 0 to 10 scale.",
		html: npsHtml,
		variables: [
			firstName,
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-csat",
		name: "Support satisfaction",
		slug: "acme-survey-csat",
		category: "surveys",
		description:
			"Acme good, okay, or bad rating after a support ticket is solved.",
		html: csatHtml,
		variables: [
			firstName,
			{ name: "agent_name", type: "string", defaultValue: "Sam" },
			{ name: "ticket_id", type: "string", defaultValue: "48213" },
			{ name: "rating_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-onboarding",
		name: "Onboarding survey",
		slug: "acme-survey-onboarding",
		category: "surveys",
		description:
			"Acme short survey about the first two weeks of getting started.",
		html: onboardingHtml,
		variables: [
			firstName,
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-cancellation",
		name: "Cancellation reason",
		slug: "acme-survey-cancellation",
		category: "surveys",
		description: "Acme one-click question asking why a customer canceled.",
		html: cancellationHtml,
		variables: [
			firstName,
			{ name: "end_date", type: "string", defaultValue: "Nov 14, 2026" },
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-product-market-fit",
		name: "Product-market fit",
		slug: "acme-survey-product-market-fit",
		category: "surveys",
		description:
			'Acme "how disappointed would you be" survey for active customers.',
		html: productMarketFitHtml,
		variables: [
			firstName,
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-feature-vote",
		name: "Feature vote",
		slug: "acme-survey-feature-vote",
		category: "surveys",
		description:
			"Acme roadmap vote where customers pick the next feature to build.",
		html: featureVoteHtml,
		variables: [
			firstName,
			{ name: "vote_deadline", type: "string", defaultValue: "Oct 31, 2026" },
			{ name: "vote_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-research-interview",
		name: "User research invite",
		slug: "acme-survey-research-interview",
		category: "surveys",
		description:
			"Acme invitation to a 30-minute research call with a thank-you gift.",
		html: researchInterviewHtml,
		variables: [
			firstName,
			{ name: "incentive", type: "string", defaultValue: "$100 gift card" },
			{ name: "booking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-annual",
		name: "Annual customer survey",
		slug: "acme-survey-annual",
		category: "surveys",
		description:
			"Acme yearly customer survey with time to complete and a thank-you.",
		html: annualSurveyHtml,
		variables: [
			firstName,
			{ name: "close_date", type: "string", defaultValue: "Oct 30, 2026" },
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-reminder",
		name: "Survey reminder",
		slug: "acme-survey-reminder",
		category: "surveys",
		description: "Acme last-call reminder before a customer survey closes.",
		html: surveyReminderHtml,
		variables: [
			firstName,
			{ name: "close_date", type: "string", defaultValue: "Oct 30, 2026" },
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-survey-feedback-thanks",
		name: "Thanks for your feedback",
		slug: "acme-survey-feedback-thanks",
		category: "surveys",
		description:
			"Acme follow-up thanking respondents and listing what changed because of them.",
		html: feedbackThanksHtml,
		variables: [
			firstName,
			{ name: "changes_url", type: "string", defaultValue: null },
		],
	},
];
