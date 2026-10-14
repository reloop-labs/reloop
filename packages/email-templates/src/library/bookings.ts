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
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

const date = `<span data-variable="booking_date">{{{booking_date}}}</span>`;
const time = `<span data-variable="booking_time">{{{booking_time}}}</span>`;
const host = `<span data-variable="host_name">{{{host_name}}}</span>`;
const hi = `Hi <span data-variable="first_name">{{{first_name}}}</span>`;

function bookingConfirmedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme session is booked",
		preview: "Your onboarding session is confirmed. Here are the details.",
		body: `${logo(origin)}
${heading("Your session is booked")}
${lead(`${hi}, your onboarding session with ${host} is confirmed. We'll walk through your tracking setup and first dashboards together.`)}
${details([
	{ label: "Session", value: "Onboarding · 45 min" },
	{ label: "Date", value: date },
	{ label: "Time", value: time },
	{ label: "With", value: host },
])}
${button("{{{booking_url}}}", "Add to calendar")}
${text(`Need a different time? ${link("{{{reschedule_url}}}", "Reschedule")} up to 2 hours before.`, { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer()}`,
	});
}

function bookingRescheduledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme session has moved",
		preview: "Your session has a new date and time.",
		body: `${logo(origin)}
${heading("Your session has a new time")}
${lead(`${hi}, your strategy session with ${host} has been rescheduled. Your calendar invite has been updated.`)}
${details([
	{
		label: "Was",
		value: `<span style="text-decoration:line-through"><span data-variable="previous_date">{{{previous_date}}}</span></span>`,
	},
	{
		label: "Now",
		value: `${date} · ${time}`,
		strong: true,
	},
])}
${button("{{{booking_url}}}", "View booking")}
${text("Didn't make this change? Reply to this email and we'll sort it out.", { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer()}`,
	});
}

function bookingCanceledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme session was canceled",
		preview:
			"Your session has been canceled. Book a new time whenever you're ready.",
		body: `${logo(origin)}
${heading("Your session was canceled")}
${lead(`${hi}, your onboarding session on ${date} at ${time} has been canceled. Nothing else on your account has changed.`)}
${text("Whenever you're ready, pick a new time that suits you. Sessions are free on every paid plan.")}
${button("{{{booking_url}}}", "Book a new time")}
${text(`Prefer to get started on your own? Our ${link("#", "setup guide")} covers the same ground.`, { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer()}`,
	});
}

function bookingReminderPrepHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme session is tomorrow",
		preview: "Three things to have ready before your session tomorrow.",
		body: `${logo(origin)}
${eyebrow("Tomorrow")}
${heading("Get ready for your session")}
${lead(`${hi}, you're meeting ${host} tomorrow at ${time}. A little prep means we can spend the whole time on your questions.`, 32)}
${step(1, "Have admin access ready", "Sign in to Acme as an admin so we can review settings together.")}
${step(2, "Pick two key pages", "Choose the pages or events that matter most to your team.")}
${step(3, "Write down your questions", "Anything about funnels, goals, or reports is fair game.")}
${button("{{{join_url}}}", "Join the session")}
${text(`Can't make it? ${link("{{{reschedule_url}}}", "Pick another time")}.`, { marginBottom: 24 })}
${fallback("{{{join_url}}}")}
${footer()}`,
	});
}

function bookingWaitlistOpenedHtml(origin: string): string {
	return acmeEmail({
		title: "A spot opened up",
		preview:
			"A session you were waiting for is available. Claim it before it's gone.",
		body: `${logo(origin)}
${heading("A spot just opened up")}
${lead(`${hi}, a session you were on the waitlist for is now free. It's held for you until <span data-variable="hold_expires">{{{hold_expires}}}</span>.`)}
${details([
	{ label: "Session", value: "Analytics strategy · 60 min" },
	{ label: "When", value: `${date} · ${time}` },
	{ label: "With", value: host },
])}
${button("{{{claim_url}}}", "Claim this spot")}
${text("If you don't claim it in time, it goes to the next person on the list and you stay on the waitlist.", { marginBottom: 24 })}
${fallback("{{{claim_url}}}")}
${footer()}`,
	});
}

function bookingNoShowHtml(origin: string): string {
	return acmeEmail({
		title: "We missed you today",
		preview: "Looks like you couldn't make your session. Book a new time.",
		body: `${logo(origin)}
${heading("We missed you today")}
${lead(`${hi}, ${host} waited for you at ${time} but it looks like you couldn't make it. No problem, things come up.`)}
${text("Your session credit is still on your account, so booking a new time is free.")}
${button("{{{booking_url}}}", "Book a new time")}
${text("If the time zone or invite looked wrong, reply and let us know so we can fix it.", { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer()}`,
	});
}

function bookingFollowUpHtml(origin: string): string {
	return acmeEmail({
		title: "Notes from your Acme session",
		preview: "Your session notes and the next steps we agreed on.",
		body: `${logo(origin)}
${heading("Thanks for your time today")}
${lead(`${hi}, it was great working with you. Here are the next steps ${host} suggested in your session.`, 32)}
${step(1, "Add your signup event", "Track the signup button so your funnel shows real conversion.")}
${step(2, "Create a weekly report", "Send the traffic overview to your team every Monday.")}
${step(3, "Set a goal for pricing visits", "Know when interest in pricing goes up or down.")}
${button("{{{notes_url}}}", "View session notes")}
${text(`Have more questions? ${link("{{{booking_url}}}", "Book a follow-up")} any time.`, { marginBottom: 24 })}
${fallback("{{{notes_url}}}")}
${footer()}`,
	});
}

function demoCallBookedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme demo is booked",
		preview: "Your demo is confirmed. Join from the video link below.",
		body: `${logo(origin)}
${heading("Your demo is booked")}
${lead(`${hi}, thanks for booking a demo. ${host} will show you how Acme fits <span data-variable="company_name">{{{company_name}}}</span> and answer your questions.`)}
${details([
	{ label: "Date", value: date },
	{ label: "Time", value: time },
	{ label: "Length", value: "30 minutes" },
	{ label: "Where", value: link("{{{video_url}}}", "Video call") },
])}
${button("{{{video_url}}}", "Join video call")}
${text("Bringing teammates? Forward this email and they can join from the same link.", { marginBottom: 24 })}
${fallback("{{{video_url}}}")}
${footer()}`,
	});
}

function bookingDepositReceivedHtml(origin: string): string {
	return acmeEmail({
		title: "Deposit received for your Acme workshop",
		preview: "We've received your deposit. Your workshop date is secured.",
		body: `${logo(origin)}
${heading("Deposit received")}
${lead(`${hi}, thanks for your deposit. Your on-site analytics workshop on ${date} is secured.`)}
${details([
	{ label: "Workshop", value: "On-site analytics · Full day" },
	{ label: "Total", value: "$2,400.00" },
	{
		label: "Deposit paid",
		value: `<span data-variable="deposit_amount">{{{deposit_amount}}}</span>`,
	},
	{
		label: "Balance due",
		value: "$1,800.00",
		note: `Due by <span data-variable="balance_due_date">{{{balance_due_date}}}</span>`,
		strong: true,
	},
])}
${button("{{{booking_url}}}", "View booking")}
${text("Your deposit is fully refundable if you cancel at least 14 days before the workshop.", { marginBottom: 24 })}
${fallback("{{{booking_url}}}")}
${footer()}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;
const hostName = {
	name: "host_name",
	type: "string",
	defaultValue: "Jordan Lee",
} as const;
const bookingDate = {
	name: "booking_date",
	type: "string",
	defaultValue: "Oct 21, 2026",
} as const;
const bookingTime = {
	name: "booking_time",
	type: "string",
	defaultValue: "2:00 PM UTC",
} as const;
const bookingUrl = {
	name: "booking_url",
	type: "string",
	defaultValue: null,
} as const;
const rescheduleUrl = {
	name: "reschedule_url",
	type: "string",
	defaultValue: null,
} as const;

export const bookingsTemplates: EmailTemplateExample[] = [
	{
		id: "acme-booking-confirmed",
		name: "Booking confirmed",
		slug: "acme-booking-confirmed",
		category: "bookings",
		description:
			"Confirms a booked session with date, time, and host, plus calendar and reschedule links.",
		html: bookingConfirmedHtml,
		variables: [
			firstName,
			hostName,
			bookingDate,
			bookingTime,
			bookingUrl,
			rescheduleUrl,
		],
	},
	{
		id: "acme-booking-rescheduled",
		name: "Booking rescheduled",
		slug: "acme-booking-rescheduled",
		category: "bookings",
		description:
			"Shows the old time struck through next to the new one after a session is moved.",
		html: bookingRescheduledHtml,
		variables: [
			firstName,
			hostName,
			{
				name: "previous_date",
				type: "string",
				defaultValue: "Oct 18, 2026 · 11:00 AM UTC",
			},
			bookingDate,
			bookingTime,
			bookingUrl,
		],
	},
	{
		id: "acme-booking-canceled",
		name: "Booking canceled",
		slug: "acme-booking-canceled",
		category: "bookings",
		description:
			"Plain cancellation notice with a button to book a new time and a self-serve alternative.",
		html: bookingCanceledHtml,
		variables: [firstName, bookingDate, bookingTime, bookingUrl],
	},
	{
		id: "acme-booking-reminder-prep",
		name: "Session reminder with prep",
		slug: "acme-booking-reminder-prep",
		category: "bookings",
		description:
			"Day-before reminder with a numbered prep checklist and a join button.",
		html: bookingReminderPrepHtml,
		variables: [
			firstName,
			hostName,
			bookingTime,
			{ name: "join_url", type: "string", defaultValue: null },
			rescheduleUrl,
		],
	},
	{
		id: "acme-booking-waitlist-opened",
		name: "Waitlist spot opened",
		slug: "acme-booking-waitlist-opened",
		category: "bookings",
		description:
			"Tells a waitlisted customer a slot is free and how long it's held for them.",
		html: bookingWaitlistOpenedHtml,
		variables: [
			firstName,
			hostName,
			bookingDate,
			bookingTime,
			{
				name: "hold_expires",
				type: "string",
				defaultValue: "Oct 15, 2026 at 5:00 PM UTC",
			},
			{ name: "claim_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-booking-no-show",
		name: "Missed session",
		slug: "acme-booking-no-show",
		category: "bookings",
		description:
			"Friendly no-show follow-up that keeps the session credit and invites a rebooking.",
		html: bookingNoShowHtml,
		variables: [firstName, hostName, bookingTime, bookingUrl],
	},
	{
		id: "acme-booking-follow-up",
		name: "Session follow-up",
		slug: "acme-booking-follow-up",
		category: "bookings",
		description:
			"Post-session recap with the agreed next steps and a link to the full notes.",
		html: bookingFollowUpHtml,
		variables: [
			firstName,
			hostName,
			{ name: "notes_url", type: "string", defaultValue: null },
			bookingUrl,
		],
	},
	{
		id: "acme-demo-call-booked",
		name: "Demo call booked",
		slug: "acme-demo-call-booked",
		category: "bookings",
		description:
			"Sales demo confirmation with call details and a video link teammates can join from.",
		html: demoCallBookedHtml,
		variables: [
			firstName,
			hostName,
			{ name: "company_name", type: "string", defaultValue: "your team" },
			bookingDate,
			bookingTime,
			{ name: "video_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-booking-deposit-received",
		name: "Deposit received",
		slug: "acme-booking-deposit-received",
		category: "bookings",
		description:
			"Confirms a deposit for a paid booking with the total, amount paid, and balance due.",
		html: bookingDepositReceivedHtml,
		variables: [
			firstName,
			bookingDate,
			{ name: "deposit_amount", type: "string", defaultValue: "$600.00" },
			{ name: "balance_due_date", type: "string", defaultValue: "Nov 4, 2026" },
			bookingUrl,
		],
	},
];
