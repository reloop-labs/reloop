import {
	acmeEmail,
	button,
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

const hi = `Hi <span data-variable="first_name">{{{first_name}}}</span>`;
const event = `<span data-variable="event_name">{{{event_name}}}</span>`;
const eventDate = `<span data-variable="event_date">{{{event_date}}}</span>`;
const eventTime = `<span data-variable="event_time">{{{event_time}}}</span>`;

function webinarRegisteredHtml(origin: string): string {
	return acmeEmail({
		title: "You're registered",
		preview: "Your spot is saved. Here's how to join the webinar.",
		body: `${logo(origin)}
${heading("You're registered")}
${lead(`${hi}, your spot for ${event} is saved. We'll send a reminder an hour before we go live.`)}
${details([
	{ label: "Date", value: eventDate },
	{ label: "Time", value: eventTime },
	{ label: "Length", value: "45 min + Q&amp;A" },
	{ label: "Host", value: "Priya Shah, Head of Product" },
])}
${button("{{{join_url}}}", "Add to calendar")}
${text("Can't make it live? Stay registered and we'll email you the recording.", { marginBottom: 24 })}
${fallback("{{{join_url}}}")}
${footer()}`,
	});
}

function webinarStartingSoonHtml(origin: string): string {
	return acmeEmail({
		title: "Starting in 1 hour",
		preview: "The webinar starts in one hour. Your join link is inside.",
		body: `${logo(origin)}
${eyebrow("Starts in 1 hour")}
${heading(`We go live at ${eventTime}`)}
${lead(`${hi}, ${event} starts in one hour. Join a few minutes early to test your audio.`)}
${button("{{{join_url}}}", "Join webinar")}
${text("Got a question you want answered? Reply to this email and we'll try to cover it live.", { marginBottom: 24 })}
${fallback("{{{join_url}}}")}
${footer()}`,
	});
}

function eventTomorrowHtml(origin: string): string {
	return acmeEmail({
		title: "See you tomorrow",
		preview: "Venue, schedule, and what to bring for tomorrow.",
		body: `${logo(origin)}
${heading("See you tomorrow")}
${lead(`${hi}, ${event} is tomorrow at <span data-variable="venue_name">{{{venue_name}}}</span>. Here's the plan for the day.`)}
${details([
	{ label: "Doors open", value: "8:30 AM", note: "Badge pickup and coffee" },
	{ label: "Keynote", value: "9:30 AM", note: "What's next for Acme" },
	{
		label: "Workshops",
		value: "11:00 AM",
		note: "Funnels, retention, and reporting",
	},
	{ label: "Closing drinks", value: "5:00 PM" },
])}
${button("{{{ticket_url}}}", "View your ticket")}
${text(`Bring your ticket on your phone and a photo ID. ${link("{{{directions_url}}}", "Get directions")}.`, { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function recordingAvailableHtml(origin: string): string {
	return acmeEmail({
		title: "The recording is ready",
		preview: "Watch the full webinar and grab the slides.",
		body: `${logo(origin)}
${heading("The recording is ready")}
${lead(`${hi}, thanks for registering for ${event}. The full recording and slides are now available.`, 32)}
${step(1, "Watch the recording", "48 minutes, with chapters so you can skip to what matters.")}
${step(2, "Download the slides", "Every chart and query from the session.")}
${step(3, "Try it in your workspace", "The funnel template from the demo is ready to copy.")}
${button("{{{recording_url}}}", "Watch now")}
${text("The recording stays available for 30 days.", { marginBottom: 24 })}
${fallback("{{{recording_url}}}")}
${footer()}`,
	});
}

function eventPostponedHtml(origin: string): string {
	return acmeEmail({
		title: "Event postponed",
		preview: "The event has a new date. Your ticket still works.",
		body: `${logo(origin)}
${heading(`We've moved the event`)}
${lead(`${hi}, we've had to postpone ${event}. We're sorry for the change. Your ticket is valid for the new date with nothing to do.`)}
${details([
	{
		label: "Original date",
		value: `<span style="text-decoration:line-through"><span data-variable="original_date">{{{original_date}}}</span></span>`,
	},
	{ label: "New date", value: eventDate, strong: true },
])}
${button("{{{ticket_url}}}", "View your ticket")}
${text(`Can't make the new date? ${link("{{{refund_url}}}", "Request a full refund")} before ${eventDate}.`, { marginBottom: 24 })}
${fallback("{{{ticket_url}}}")}
${footer()}`,
	});
}

function eventWaitlistHtml(origin: string): string {
	return acmeEmail({
		title: "You're on the waitlist",
		preview: "The event is full, but you're on the list for the next spot.",
		body: `${logo(origin)}
${heading("You're on the waitlist")}
${lead(`${hi}, ${event} is full right now, but you're on the waitlist. If a spot opens, we'll email you right away.`)}
${details([
	{
		label: "Your position",
		value: `#<span data-variable="waitlist_position">{{{waitlist_position}}}</span>`,
		strong: true,
	},
	{ label: "Event date", value: eventDate },
])}
${button("{{{event_url}}}", "View event")}
${text("Spots usually open in the final week. You'll have 24 hours to claim one.", { marginBottom: 24 })}
${fallback("{{{event_url}}}")}
${footer()}`,
	});
}

function speakerConfirmedHtml(origin: string): string {
	return acmeEmail({
		title: "You're confirmed as a speaker",
		preview: "Your talk is on the agenda. Here's what we need from you.",
		body: `${logo(origin)}
${eyebrow("Speaker")}
${heading("Your talk is confirmed")}
${lead(`${hi}, thanks for speaking at ${event}. "<span data-variable="talk_title">{{{talk_title}}}</span>" is on the agenda for ${eventDate}.`, 32)}
${step(1, "Send your bio and headshot", "We'll use them on the event page and agenda.")}
${step(2, "Share your slides", "Upload them by Nov 2 so we can run a tech check.")}
${step(3, "Join the speaker rehearsal", "A 20 minute call the week before the event.")}
${button("{{{speaker_portal_url}}}", "Open speaker portal")}
${text("Your speaker pass covers entry, lunch, and the evening reception.", { marginBottom: 24 })}
${fallback("{{{speaker_portal_url}}}")}
${footer()}`,
	});
}

function eventFeedbackHtml(origin: string): string {
	return acmeEmail({
		title: "How was the event?",
		preview: "Two minutes of feedback shapes next year's event.",
		body: `${logo(origin)}
${heading("How was the event?")}
${lead(`${hi}, thanks for joining us at ${event}. We'd love to hear what worked and what we should change next time.`)}
${text("The survey takes about two minutes. Everyone who finishes it gets early access to next year's tickets.")}
${button("{{{survey_url}}}", "Share feedback")}
${text(`Missed a session? ${link("{{{recording_url}}}", "Watch the recordings")}.`, { marginBottom: 24 })}
${fallback("{{{survey_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function earlyBirdEndingHtml(origin: string): string {
	return acmeEmail({
		title: "Early-bird pricing ends Friday",
		preview: "Save on conference tickets before early-bird pricing ends.",
		body: `${logo(origin)}
${heading("Early-bird pricing ends soon")}
${lead(`${hi}, tickets for ${event} go up after <span data-variable="offer_expiry">{{{offer_expiry}}}</span>. Lock in the lower price now.`)}
${offer({
	amount: "$199",
	label: "Full conference pass · usually $349",
	expires: `Early-bird ends <span data-variable="offer_expiry">{{{offer_expiry}}}</span>`,
})}
${button("{{{tickets_url}}}", "Get your ticket")}
${text("Your pass includes every talk and workshop, lunch, and the recordings afterward.", { marginBottom: 24 })}
${fallback("{{{tickets_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;
const webinarName = {
	name: "event_name",
	type: "string",
	defaultValue: "Funnels that explain churn",
} as const;
const summitName = {
	name: "event_name",
	type: "string",
	defaultValue: "Acme Analytics Summit",
} as const;
const eventDateVar = {
	name: "event_date",
	type: "string",
	defaultValue: "Nov 12, 2026",
} as const;
const eventTimeVar = {
	name: "event_time",
	type: "string",
	defaultValue: "4:00 PM UTC",
} as const;
const joinUrl = {
	name: "join_url",
	type: "string",
	defaultValue: null,
} as const;
const ticketUrl = {
	name: "ticket_url",
	type: "string",
	defaultValue: null,
} as const;
const recordingUrl = {
	name: "recording_url",
	type: "string",
	defaultValue: null,
} as const;

export const eventsTemplates: EmailTemplateExample[] = [
	{
		id: "acme-webinar-registered",
		name: "Webinar registration",
		slug: "acme-webinar-registered",
		category: "events",
		description:
			"Confirms a webinar registration with the date, time, host, and a calendar button.",
		html: webinarRegisteredHtml,
		variables: [firstName, webinarName, eventDateVar, eventTimeVar, joinUrl],
	},
	{
		id: "acme-webinar-starting-soon",
		name: "Webinar starting soon",
		slug: "acme-webinar-starting-soon",
		category: "events",
		description:
			"Short one-hour-out reminder that leads with the start time and a join button.",
		html: webinarStartingSoonHtml,
		variables: [firstName, webinarName, eventTimeVar, joinUrl],
	},
	{
		id: "acme-event-tomorrow",
		name: "Event tomorrow",
		slug: "acme-event-tomorrow",
		category: "events",
		description:
			"Day-before reminder for an in-person event with the venue, day schedule, and directions.",
		html: eventTomorrowHtml,
		variables: [
			firstName,
			summitName,
			{
				name: "venue_name",
				type: "string",
				defaultValue: "Pier 27, San Francisco",
			},
			ticketUrl,
			{ name: "directions_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-webinar-recording",
		name: "Recording available",
		slug: "acme-webinar-recording",
		category: "events",
		description:
			"Sends the webinar recording and slides to registrants, with what's inside.",
		html: recordingAvailableHtml,
		variables: [firstName, webinarName, recordingUrl],
	},
	{
		id: "acme-event-postponed",
		name: "Event postponed",
		slug: "acme-event-postponed",
		category: "events",
		description:
			"Announces a new event date, keeps tickets valid, and offers a refund link.",
		html: eventPostponedHtml,
		variables: [
			firstName,
			summitName,
			{ name: "original_date", type: "string", defaultValue: "Nov 12, 2026" },
			{ ...eventDateVar, defaultValue: "Jan 21, 2027" },
			ticketUrl,
			{ name: "refund_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-event-waitlist",
		name: "Event waitlist confirmed",
		slug: "acme-event-waitlist",
		category: "events",
		description:
			"Confirms a spot on a sold-out event's waitlist with the attendee's position.",
		html: eventWaitlistHtml,
		variables: [
			firstName,
			summitName,
			{ name: "waitlist_position", type: "string", defaultValue: "14" },
			eventDateVar,
			{ name: "event_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-event-speaker-confirmed",
		name: "Speaker confirmation",
		slug: "acme-event-speaker-confirmed",
		category: "events",
		description:
			"Welcomes a confirmed speaker with their talk slot and a checklist of what to send.",
		html: speakerConfirmedHtml,
		variables: [
			firstName,
			summitName,
			{
				name: "talk_title",
				type: "string",
				defaultValue: "Measuring what matters in onboarding",
			},
			eventDateVar,
			{ name: "speaker_portal_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-event-feedback",
		name: "Event feedback",
		slug: "acme-event-feedback",
		category: "events",
		description:
			"Post-event survey ask with an early-access incentive and a link to session recordings.",
		html: eventFeedbackHtml,
		variables: [
			firstName,
			summitName,
			{ name: "survey_url", type: "string", defaultValue: null },
			recordingUrl,
		],
	},
	{
		id: "acme-event-early-bird-ending",
		name: "Early-bird ending",
		slug: "acme-event-early-bird-ending",
		category: "events",
		description:
			"Last-call promo for discounted conference passes with the price and deadline.",
		html: earlyBirdEndingHtml,
		variables: [
			firstName,
			summitName,
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 16, 2026" },
			{ name: "tickets_url", type: "string", defaultValue: null },
		],
	},
];
