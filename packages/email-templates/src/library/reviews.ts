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
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Five linked stars, each pointing at its own one-click rating URL. */
function ratingStars(): string {
	const cells = [1, 2, 3, 4, 5]
		.map(
			(n) => `<td style="padding:0 4px;text-align:center">
<a href="{{{rating_${n}_url}}}" target="_blank" style="display:inline-block;width:52px;padding:10px 0 8px 0;border:1px solid ${acme.line};border-radius:10px;text-decoration:none;font-family:${acme.font}">
<span style="display:block;font-size:24px;line-height:28px;color:${acme.ink}">&#9733;</span>
<span style="display:block;font-size:12px;line-height:18px;color:${acme.muted}">${n}</span>
</a>
</td>`,
		)
		.join("\n");
	return block(
		`<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto">
<tbody>
<tr>
${cells}
</tr>
</tbody>
</table>
<p style="margin:12px 0 0 0;font-size:13px;line-height:20px;color:${acme.muted};text-align:center;font-family:${acme.font}">1 = not for me &nbsp;·&nbsp; 5 = love it</p>`,
		"padding:0",
		"margin:0 0 32px 0",
	);
}

/** Tinted quote panel for a customer's review or a team reply. */
function quote(html: string, byline: string): string {
	return block(
		`<p style="margin:0 0 10px 0;font-size:16px;line-height:26px;color:${acme.ink};font-family:${acme.font}">${html}</p>
<p style="margin:0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${acme.font}">${byline}</p>`,
		`padding:20px 22px;background-color:${acme.tint};border-radius:10px`,
		"margin:0 0 28px 0",
	);
}

function reviewRequestHtml(origin: string): string {
	return acmeEmail({
		title: "How is your Acme Desk Sensor?",
		preview: "You've had it for a week. Tell other buyers what you think.",
		body: `${logo(origin)}
${heading("How is your Desk Sensor working out?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your <span data-variable="product_name">{{{product_name}}}</span> arrived a week ago. A short review helps other teams decide if it's right for their space.`)}
${details([
	{
		label: `<span data-variable="product_name">{{{product_name}}}</span>`,
		value: "Qty 1",
		note: "Charcoal · USB-C",
	},
	{
		label: "Order",
		value: `#<span data-variable="order_number">{{{order_number}}}</span>`,
	},
])}
${button("{{{review_url}}}", "Write a review")}
${text("It takes about two minutes. Honest reviews, good or bad, are the most useful.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function reviewReminderHtml(origin: string): string {
	return acmeEmail({
		title: "Still have a minute for a review?",
		preview: "A quick reminder to share how your Acme order is going.",
		body: `${logo(origin)}
${heading("Still have a minute for a review?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we asked last week how your <span data-variable="product_name">{{{product_name}}}</span> is going. If you've had time to settle in, we'd love to hear about it.`)}
${text("A few things other buyers often ask about:", { marginBottom: 12 })}
${text("How easy setup was &nbsp;·&nbsp; Battery life so far &nbsp;·&nbsp; How the readings match your space", { color: acme.ink })}
${button("{{{review_url}}}", "Leave a review")}
${text("This is the last reminder we'll send about this order.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function reviewStarRatingHtml(origin: string): string {
	return acmeEmail({
		title: "Rate your Acme Desk Sensor",
		preview: "One click is all it takes. Pick a star to rate your order.",
		body: `${logo(origin)}
${heading("How would you rate it?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, tap a star to rate your <span data-variable="product_name">{{{product_name}}}</span>. One click saves your rating, no sign-in needed.`)}
${ratingStars()}
${text("Want to say more? You can add a written review and photos after you rate.", { marginBottom: 28 })}
${button("{{{review_url}}}", "Write a full review")}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function reviewThanksHtml(origin: string): string {
	return acmeEmail({
		title: "Thanks for your review",
		preview: "We read every review. Here's what happens next.",
		body: `${logo(origin)}
${heading("Thanks for your review")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we got your review of the <span data-variable="product_name">{{{product_name}}}</span>. Every one is read by someone on our product team.`)}
${step(1, "We check it", "Reviews are checked against our guidelines, usually within one business day.")}
${step(2, "It goes live", "We'll email you when your review is published on the product page.")}
${step(3, "We act on it", "Common requests go straight into our hardware and firmware roadmap.")}
${button("{{{review_url}}}", "View your review")}
${text("Need to change something? You can edit your review any time before it's published.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer()}`,
	});
}

function reviewPublishedHtml(origin: string): string {
	return acmeEmail({
		title: "Your review is live",
		preview: "Your review of the Acme Desk Sensor is now on the product page.",
		body: `${logo(origin)}
${eyebrow("Review published")}
${heading("Your review is live")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your review is now on the <span data-variable="product_name">{{{product_name}}}</span> page for other buyers to read.`)}
${quote(`"Setup took five minutes and the occupancy readings match what we see in the office. Battery is at 90% after three weeks."`, "Your review · 5 stars · Verified purchase")}
${button("{{{review_url}}}", "See it on the store")}
${text("You can edit or remove your review from your account at any time.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer()}`,
	});
}

function reviewTeamReplyHtml(origin: string): string {
	return acmeEmail({
		title: "The Acme team replied to your review",
		preview: "Someone from our team responded to your review.",
		body: `${logo(origin)}
${heading("We replied to your review")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, thanks for taking the time to review the <span data-variable="product_name">{{{product_name}}}</span>. Here's our reply.`)}
${quote(`"Sorry the sensor dropped off Wi-Fi overnight. Firmware 2.4, out today, fixes reconnects on 5 GHz networks. If it happens again, reply here and we'll send a replacement."`, `<span data-variable="reply_author">{{{reply_author}}}</span> · Acme Hardware Support`)}
${button("{{{review_url}}}", "View the conversation")}
${text("Your reply will show publicly under your review.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer()}`,
	});
}

function appStoreRatingHtml(origin: string): string {
	return acmeEmail({
		title: "Enjoying the Acme app?",
		preview: "A quick rating in the app store helps more teams find Acme.",
		body: `${logo(origin)}
${heading("Enjoying the Acme app?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you've checked your dashboards from the Acme mobile app 30 times this month. If it's been useful, a quick rating goes a long way.`)}
${details([
	{ label: "Sessions this month", value: "30" },
	{ label: "Most viewed", value: "Live visitors" },
	{ label: "Alerts received", value: "12" },
])}
${button("{{{app_store_url}}}", "Rate the app")}
${text(`Something not working? ${link("{{{feedback_url}}}", "Tell us first")} and we'll fix it.`, { marginBottom: 24 })}
${fallback("{{{app_store_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function softwareReviewRequestHtml(origin: string): string {
	return acmeEmail({
		title: "Would you review Acme?",
		preview:
			"Share your experience on a software review site and we'll send a thank-you.",
		body: `${logo(origin)}
${heading("Would you review Acme?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your team has used Acme for six months. Teams comparing analytics tools rely on reviews from people like you.`)}
${step(1, "Open the review form", "It's hosted on an independent software review site.")}
${step(2, "Answer a few questions", "What you use Acme for, what works, and what could be better.")}
${step(3, "Get a thank-you", `Once it's approved, we'll send you a <span data-variable="reward">{{{reward}}}</span>.`)}
${button("{{{review_url}}}", "Write a review")}
${text("We don't see or edit your review before it's posted. Honest feedback helps everyone.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function betaFeedbackHtml(origin: string): string {
	return acmeEmail({
		title: "How is the Funnels beta going?",
		preview: "Five quick questions about the new Funnels beta.",
		body: `${logo(origin)}
${eyebrow("Beta feedback")}
${heading("How is the Funnels beta going?")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you've been using <span data-variable="feature_name">{{{feature_name}}}</span> for two weeks. Your answers decide what we fix before it ships to everyone.`)}
${details([
	{ label: "Questions", value: "5" },
	{ label: "Time", value: "About 3 minutes" },
	{
		label: "Closes",
		value: `<span data-variable="survey_close_date">{{{survey_close_date}}}</span>`,
	},
])}
${button("{{{survey_url}}}", "Share feedback")}
${text("Found a bug? Reply to this email with a screenshot and it goes straight to the team building it.", { marginBottom: 24 })}
${fallback("{{{survey_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function photoReviewIncentiveHtml(origin: string): string {
	return acmeEmail({
		title: "Add a photo, get 15% off",
		preview: "Show us your Desk Sensor setup and take 15% off your next order.",
		body: `${logo(origin)}
${heading("Show us your setup")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, add a photo to your <span data-variable="product_name">{{{product_name}}}</span> review and we'll send you a code for your next order.`)}
${offer({
	amount: "15% off",
	label: "Your next Acme hardware order",
	expires: `Add your photo by <span data-variable="offer_expiry">{{{offer_expiry}}}</span>`,
})}
${button("{{{review_url}}}", "Add a photo review")}
${text("Any photo of the sensor in use counts. Desks, meeting rooms, and shelves all work.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;
const productName = {
	name: "product_name",
	type: "string",
	defaultValue: "Acme Desk Sensor",
} as const;
const reviewUrl = {
	name: "review_url",
	type: "string",
	defaultValue: null,
} as const;

export const reviewsTemplates: EmailTemplateExample[] = [
	{
		id: "acme-review-request",
		name: "Review request",
		slug: "acme-review-request",
		category: "reviews",
		description:
			"Post-delivery ask to review a product, with the order item and a single review button.",
		html: reviewRequestHtml,
		variables: [
			firstName,
			productName,
			{ name: "order_number", type: "string", defaultValue: "40218" },
			reviewUrl,
		],
	},
	{
		id: "acme-review-reminder",
		name: "Review reminder",
		slug: "acme-review-reminder",
		category: "reviews",
		description:
			"Gentle last nudge to review a purchase, with prompts for what to write about.",
		html: reviewReminderHtml,
		variables: [firstName, productName, reviewUrl],
	},
	{
		id: "acme-review-star-rating",
		name: "One-click star rating",
		slug: "acme-review-star-rating",
		category: "reviews",
		description:
			"Five linked stars that each record a rating in one click, plus a full-review button.",
		html: reviewStarRatingHtml,
		variables: [
			firstName,
			productName,
			{ name: "rating_1_url", type: "string", defaultValue: null },
			{ name: "rating_2_url", type: "string", defaultValue: null },
			{ name: "rating_3_url", type: "string", defaultValue: null },
			{ name: "rating_4_url", type: "string", defaultValue: null },
			{ name: "rating_5_url", type: "string", defaultValue: null },
			reviewUrl,
		],
	},
	{
		id: "acme-review-thanks",
		name: "Thanks for your review",
		slug: "acme-review-thanks",
		category: "reviews",
		description:
			"Confirms a review was received and explains the moderation steps before it goes live.",
		html: reviewThanksHtml,
		variables: [firstName, productName, reviewUrl],
	},
	{
		id: "acme-review-published",
		name: "Review published",
		slug: "acme-review-published",
		category: "reviews",
		description:
			"Lets a customer know their review is live, quoting it back with its star rating.",
		html: reviewPublishedHtml,
		variables: [firstName, productName, reviewUrl],
	},
	{
		id: "acme-review-team-reply",
		name: "Reply to your review",
		slug: "acme-review-team-reply",
		category: "reviews",
		description:
			"Notifies a reviewer that the team responded, with the reply quoted in full.",
		html: reviewTeamReplyHtml,
		variables: [
			firstName,
			productName,
			{ name: "reply_author", type: "string", defaultValue: "Maya" },
			reviewUrl,
		],
	},
	{
		id: "acme-app-store-rating",
		name: "App store rating request",
		slug: "acme-app-store-rating",
		category: "reviews",
		description:
			"Asks active mobile users for an app store rating, with their usage stats and a feedback escape hatch.",
		html: appStoreRatingHtml,
		variables: [
			firstName,
			{ name: "app_store_url", type: "string", defaultValue: null },
			{ name: "feedback_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-software-review-request",
		name: "Software review site request",
		slug: "acme-software-review-request",
		category: "reviews",
		description:
			"Invites long-time SaaS customers to review the product on a third-party review site, with a thank-you reward.",
		html: softwareReviewRequestHtml,
		variables: [
			firstName,
			{ name: "reward", type: "string", defaultValue: "$25 gift card" },
			reviewUrl,
		],
	},
	{
		id: "acme-beta-feedback-request",
		name: "Beta feedback request",
		slug: "acme-beta-feedback-request",
		category: "reviews",
		description:
			"Short survey invite for beta testers, with question count, time needed, and close date.",
		html: betaFeedbackHtml,
		variables: [
			firstName,
			{ name: "feature_name", type: "string", defaultValue: "Funnels" },
			{
				name: "survey_close_date",
				type: "string",
				defaultValue: "Oct 28, 2026",
			},
			{ name: "survey_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-photo-review-incentive",
		name: "Photo review incentive",
		slug: "acme-photo-review-incentive",
		category: "reviews",
		description:
			"Offers a discount on the next order in exchange for adding a photo to a product review.",
		html: photoReviewIncentiveHtml,
		variables: [
			firstName,
			productName,
			{ name: "offer_expiry", type: "string", defaultValue: "Nov 15, 2026" },
			reviewUrl,
		],
	},
];
