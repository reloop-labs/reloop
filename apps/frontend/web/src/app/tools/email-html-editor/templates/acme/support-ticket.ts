import {
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeSupportTicketHtml(origin: string): string {
	return acmeEmail({
		title: "We've received your Acme support request",
		preview: "Thanks for reaching out. We'll reply within one business day.",
		body: `${logo(origin)}
${heading(`We've received your request`)}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, thanks for reaching out. Our team will reply within one business day.`)}
${details([
	{
		label: "Ticket",
		value: `#<span data-variable="ticket_id">{{{ticket_id}}}</span>`,
	},
	{ label: "Subject", value: "Events missing from dashboard" },
	{ label: "Priority", value: "Normal" },
])}
${button("{{{ticket_url}}}", "View request")}
${text("Reply to this email to add details or attachments to your request.", { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}
