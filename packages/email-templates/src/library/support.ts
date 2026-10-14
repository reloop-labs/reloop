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
	link,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Quoted message from the support agent, like the mention comment. */
function reply(html: string): string {
	return block(
		`<p style="margin:0;font-size:16px;line-height:26px;color:${acme.ink};font-family:${acme.font}">${html}</p>`,
		`padding:20px 24px;border-left:3px solid ${acme.brand}`,
		`background-color:${acme.tint};margin:0 0 28px 0`,
	);
}

/** One chat line: speaker and time in gray, then the message. */
function chatLine(speaker: string, time: string, message: string): string {
	return `<tr>
<td style="padding:14px 0;border-bottom:1px solid ${acme.line}">
<p style="margin:0 0 4px 0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${acme.font}"><span style="font-weight:500;color:${acme.ink}">${speaker}</span> &nbsp;·&nbsp; ${time}</p>
<p style="margin:0;font-size:15px;line-height:24px;color:${acme.body};font-family:${acme.font}">${message}</p>
</td>
</tr>`;
}

/** Help center article row: linked title and a gray read time. */
function articleLink(href: string, title: string, meta: string): string {
	return `<tr>
<td style="padding:14px 0;border-bottom:1px solid ${acme.line}">
<p style="margin:0 0 2px 0;font-size:16px;line-height:24px;font-weight:500;font-family:${acme.font}"><a href="${href}" target="_blank" style="color:${acme.ink};text-decoration:none">${title}</a></p>
<p style="margin:0;font-size:14px;line-height:22px;color:${acme.muted};font-family:${acme.font}">${meta}</p>
</td>
</tr>`;
}

function rows(html: string): string {
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid ${acme.line};margin:0 0 28px 0">
<tbody>
${html}
</tbody>
</table>`;
}

const ticket = `#<span data-variable="ticket_id">{{{ticket_id}}}</span>`;

function agentReplyHtml(origin: string): string {
	return acmeEmail({
		title: "New reply on your Acme support request",
		preview: "Sam from Acme support replied to your request.",
		body: `${logo(origin)}
${eyebrow(`Ticket ${ticket}`)}
${heading(`<span data-variable="agent_name">{{{agent_name}}}</span> replied to your request`)}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, there's a new reply on your request about missing events.`)}
${reply("Thanks for the details. It looks like your tracking script is loading after your consent banner blocks it. If you move the snippet below the banner script, events should start showing up within a few minutes. Can you give that a try and let me know?")}
${button("{{{ticket_url}}}", "View conversation")}
${text("Reply to this email to respond. Your message goes straight to the same thread.", { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function ticketResolvedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme support request is resolved",
		preview:
			"We've marked your request as resolved. Reply if anything's still off.",
		body: `${logo(origin)}
${heading("Your request is resolved")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've marked ticket ${ticket} as resolved. Here's a summary of what we did.`)}
${details([
	{ label: "Subject", value: "Events missing from dashboard" },
	{
		label: "Handled by",
		value: `<span data-variable="agent_name">{{{agent_name}}}</span>`,
	},
	{
		label: "Resolution",
		value: "Script order fixed",
		note: "Tracking now loads after consent is given",
	},
])}
${text("If the problem comes back or the fix didn't work, just reply to this email. Your ticket will reopen automatically and land with the same person.", { marginBottom: 28 })}
${button("{{{ticket_url}}}", "View ticket")}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function ticketClosedHtml(origin: string): string {
	return acmeEmail({
		title: "We've closed your Acme support request",
		preview: "We haven't heard back in 7 days, so we closed your request.",
		body: `${logo(origin)}
${heading("We've closed your request")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we haven't heard back on ticket ${ticket} in 7 days, so we've closed it to keep things tidy.`)}
${text("We hope that means everything is working. If you still need help, reply to this email any time in the next 30 days and we'll reopen the same ticket with all its history.", { marginBottom: 28 })}
${button("{{{ticket_url}}}", "Reopen request")}
${text(`Have a different question? ${link("{{{new_ticket_url}}}", "Start a new request")} instead.`, { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function awaitingReplyHtml(origin: string): string {
	return acmeEmail({
		title: "We're waiting on your reply",
		preview: "We need a little more information to keep helping.",
		body: `${logo(origin)}
${heading("We're waiting on your reply")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we asked a question on ticket ${ticket} two days ago and haven't heard back yet. We need it to keep going.`)}
${text("To recap, could you send us:", { marginBottom: 12, color: acme.ink })}
${step(1, "Your workspace ID", "You'll find it in Settings, under General.")}
${step(2, "A page where events are missing", "The full URL helps us reproduce the issue.")}
${step(3, "The output of acme doctor", "Run it from the folder where your site is deployed and paste the result.")}
${button("{{{ticket_url}}}", "Reply to request")}
${text(`If we don't hear back by <span data-variable="close_date">{{{close_date}}}</span>, we'll close the ticket. You can reopen it any time by replying.`, { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function ticketEscalatedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme request has been escalated",
		preview: "A specialist from our engineering team is now on your request.",
		body: `${logo(origin)}
${heading("We've escalated your request")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, ticket ${ticket} needs a closer look, so we've passed it to an engineer who works on our data pipeline.`)}
${details([
	{
		label: "Now handled by",
		value: `<span data-variable="engineer_name">{{{engineer_name}}}</span>`,
	},
	{ label: "Team", value: "Data pipeline" },
	{ label: "Priority", value: "High" },
	{
		label: "Next update by",
		value: `<span data-variable="update_by">{{{update_by}}}</span>`,
		strong: true,
	},
])}
${text("You don't need to repeat anything. They have the full conversation and your workspace details. We'll update you by the time above even if we don't have a fix yet.", { marginBottom: 28 })}
${button("{{{ticket_url}}}", "Follow progress")}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function ticketReopenedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme support request was reopened",
		preview: "Thanks for letting us know. We're on it again.",
		body: `${logo(origin)}
${heading("We've reopened your request")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, thanks for letting us know the issue isn't fixed. Ticket ${ticket} is open again and back with <span data-variable="agent_name">{{{agent_name}}}</span>, who handled it before.`)}
${text("Since they already know the history, you should hear back within a few hours during business hours. If you have new screenshots or error messages, reply to this email to add them.", { marginBottom: 28 })}
${button("{{{ticket_url}}}", "View request")}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function chatTranscriptHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme chat transcript",
		preview: "A copy of your conversation with Acme support.",
		body: `${logo(origin)}
${heading("Your chat transcript")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here's a copy of your chat with Acme support on <span data-variable="chat_date">{{{chat_date}}}</span>.`)}
${rows(
	[
		chatLine(
			"You",
			"2:14pm",
			"Hi, how do I exclude my own visits from reports?",
		),
		chatLine(
			`<span data-variable="agent_name">{{{agent_name}}}</span>`,
			"2:15pm",
			"Happy to help. Go to Settings, then Filters, and add your IP address. You can also use the browser toggle on any device.",
		),
		chatLine("You", "2:17pm", "Done. Does it apply to past data too?"),
		chatLine(
			`<span data-variable="agent_name">{{{agent_name}}}</span>`,
			"2:18pm",
			"It applies from now on. Past visits stay in your reports, but you can add a filter to hide them.",
		),
		chatLine("You", "2:18pm", "Perfect, thanks."),
	].join("\n"),
)}
${button("{{{transcript_url}}}", "View in help center")}
${text("Need more help with this? Reply to this email and we'll pick up where we left off.", { marginBottom: 24 })}
${fallback("{{{transcript_url}}}")}
${footer()}`,
	});
}

function articleSuggestionsHtml(origin: string): string {
	return acmeEmail({
		title: "These articles might help while you wait",
		preview: "Answers to similar questions from the Acme help center.",
		body: `${logo(origin)}
${heading("These might help while you wait")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've received ticket ${ticket} and a teammate will reply soon. In the meantime, these articles answer similar questions.`)}
${rows(
	[
		articleLink(
			"{{{article_one_url}}}",
			"Why aren't my events showing up?",
			"Troubleshooting · 4 min read",
		),
		articleLink(
			"{{{article_two_url}}}",
			"Using Acme with a cookie consent banner",
			"Setup · 6 min read",
		),
		articleLink(
			"{{{article_three_url}}}",
			"Checking your setup with acme doctor",
			"CLI · 3 min read",
		),
	].join("\n"),
)}
${text('Found your answer? Reply with "solved" and we\'ll close the ticket for you. Otherwise, no need to do anything.', { marginBottom: 28 })}
${button("{{{ticket_url}}}", "View your request")}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function supportCallHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme support call is confirmed",
		preview: "Your call with Acme support is booked. Details inside.",
		body: `${logo(origin)}
${heading("Your support call is confirmed")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you're booked in with <span data-variable="agent_name">{{{agent_name}}}</span> to go through ticket ${ticket} together.`)}
${details([
	{
		label: "Date",
		value: `<span data-variable="call_date">{{{call_date}}}</span>`,
	},
	{
		label: "Time",
		value: `<span data-variable="call_time">{{{call_time}}}</span>`,
	},
	{ label: "Length", value: "30 minutes" },
	{ label: "Where", value: "Video call, link below" },
])}
${button("{{{call_url}}}", "Join call")}
${text("To make the most of the time, have your Acme dashboard open and be ready to share your screen.", { marginBottom: 20 })}
${text(`Need a different time? ${link("{{{reschedule_url}}}", "Reschedule or cancel")}.`, { marginBottom: 24 })}
${fallback("{{{call_url}}}")}
${footer()}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;
const ticketId = {
	name: "ticket_id",
	type: "string",
	defaultValue: "48213",
} as const;
const agentName = {
	name: "agent_name",
	type: "string",
	defaultValue: "Sam",
} as const;
const ticketUrl = {
	name: "ticket_url",
	type: "string",
	defaultValue: null,
} as const;

export const supportTemplates: EmailTemplateExample[] = [
	{
		id: "acme-support-agent-reply",
		name: "Agent replied",
		slug: "acme-support-agent-reply",
		category: "support",
		description: "Acme notification that a support agent replied to a request.",
		html: agentReplyHtml,
		variables: [firstName, ticketId, agentName, ticketUrl],
	},
	{
		id: "acme-support-ticket-resolved",
		name: "Ticket resolved",
		slug: "acme-support-ticket-resolved",
		category: "support",
		description:
			"Acme confirmation that a support request was resolved, with a summary.",
		html: ticketResolvedHtml,
		variables: [firstName, ticketId, agentName, ticketUrl],
	},
	{
		id: "acme-support-ticket-closed",
		name: "Ticket closed",
		slug: "acme-support-ticket-closed",
		category: "support",
		description:
			"Acme notice that a support request was closed after a week without a reply.",
		html: ticketClosedHtml,
		variables: [
			firstName,
			ticketId,
			ticketUrl,
			{ name: "new_ticket_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-support-awaiting-reply",
		name: "Awaiting your reply",
		slug: "acme-support-awaiting-reply",
		category: "support",
		description:
			"Acme reminder that support needs more information to continue.",
		html: awaitingReplyHtml,
		variables: [
			firstName,
			ticketId,
			{ name: "close_date", type: "string", defaultValue: "Oct 21, 2026" },
			ticketUrl,
		],
	},
	{
		id: "acme-support-ticket-escalated",
		name: "Ticket escalated",
		slug: "acme-support-ticket-escalated",
		category: "support",
		description:
			"Acme update that a support request moved to an engineering specialist.",
		html: ticketEscalatedHtml,
		variables: [
			firstName,
			ticketId,
			{ name: "engineer_name", type: "string", defaultValue: "Priya Shah" },
			{ name: "update_by", type: "string", defaultValue: "Oct 16, 2026" },
			ticketUrl,
		],
	},
	{
		id: "acme-support-ticket-reopened",
		name: "Ticket reopened",
		slug: "acme-support-ticket-reopened",
		category: "support",
		description:
			"Acme confirmation that a resolved support request was reopened.",
		html: ticketReopenedHtml,
		variables: [firstName, ticketId, agentName, ticketUrl],
	},
	{
		id: "acme-support-chat-transcript",
		name: "Chat transcript",
		slug: "acme-support-chat-transcript",
		category: "support",
		description: "Acme copy of a live chat conversation with support.",
		html: chatTranscriptHtml,
		variables: [
			firstName,
			agentName,
			{ name: "chat_date", type: "string", defaultValue: "Oct 14, 2026" },
			{ name: "transcript_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-support-article-suggestions",
		name: "Help article suggestions",
		slug: "acme-support-article-suggestions",
		category: "support",
		description:
			"Acme help center articles related to an open support request.",
		html: articleSuggestionsHtml,
		variables: [
			firstName,
			ticketId,
			{ name: "article_one_url", type: "string", defaultValue: null },
			{ name: "article_two_url", type: "string", defaultValue: null },
			{ name: "article_three_url", type: "string", defaultValue: null },
			ticketUrl,
		],
	},
	{
		id: "acme-support-call-scheduled",
		name: "Support call scheduled",
		slug: "acme-support-call-scheduled",
		category: "support",
		description:
			"Acme confirmation of a scheduled call with support, with join details.",
		html: supportCallHtml,
		variables: [
			firstName,
			agentName,
			ticketId,
			{ name: "call_date", type: "string", defaultValue: "Oct 18, 2026" },
			{ name: "call_time", type: "string", defaultValue: "11:00am PT" },
			{ name: "call_url", type: "string", defaultValue: null },
			{ name: "reschedule_url", type: "string", defaultValue: null },
		],
	},
];
