import {
	acmeEmail,
	button,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Merge-tag span the editor recognizes as a variable. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function referralHtml(origin: string): string {
	return acmeEmail({
		title: "Give $50, get $50 with Acme",
		preview: "Share Acme with a friend and you both get $50 in credit.",
		body: `${logo(origin)}
${heading("Give $50, get $50")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, know a team that would like Acme? Send them your link. When they start a paid plan, you both get $50 in account credit.`, 32)}
${step(1, "Share your link", `Your personal link is ${v("referral_link")}.`)}
${step(2, "They sign up", "Your friend gets $50 off their first invoice on any paid plan.")}
${step(3, "You get credit", "We add $50 to your balance once their first payment goes through.")}
${button("{{{referral_url}}}", "Get my referral link")}
${text("There's no limit on referrals. Credit applies automatically to your next invoice.", { marginBottom: 24 })}
${fallback("{{{referral_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function freeAddOnHtml(origin: string): string {
	return acmeEmail({
		title: "Funnels add-on, free for 3 months",
		preview: "Try the Funnels add-on on us for the next 3 months.",
		body: `${logo(origin)}
${eyebrow("On us")}
${heading("Try Funnels free for 3 months")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we'd like ${v("workspace_name")} to try the Funnels add-on. See where visitors drop off between landing and signup, step by step.`)}
${details([
	{ label: "Funnels add-on", value: "$19.00 / month" },
	{ label: "Your price for 3 months", value: "$0.00", strong: true },
	{ label: "Activate by", value: v("offer_expiry") },
])}
${button("{{{offer_url}}}", "Add Funnels for free")}
${text("After 3 months, you can keep it for $19 a month or turn it off. We'll remind you a week before.", { marginBottom: 24 })}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function birthdayHtml(origin: string): string {
	return acmeEmail({
		title: "Happy birthday from Acme",
		preview: "A small gift for your birthday: 25% off your next month.",
		body: `${logo(origin)}
${heading(`Happy birthday, <span data-variable="first_name">{{{first_name}}}</span>`)}
${lead("We hope it's a good one. Here's a small gift from all of us at Acme to celebrate.")}
${offer({
	amount: "25% off",
	label: "your next month on any plan",
	code: v("coupon_code"),
	expires: `Valid until ${v("offer_expiry")}`,
})}
${button("{{{offer_url}}}", "Apply my gift")}
${text("The code works once and stacks with your current plan.", { marginBottom: 24 })}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function loyaltyRewardHtml(origin: string): string {
	return acmeEmail({
		title: "Thanks for 2 years with Acme",
		preview: "A thank-you for being with us: a month of Pro on the house.",
		body: `${logo(origin)}
${eyebrow("2 years with Acme")}
${heading("Thank you for sticking with us")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, ${v("workspace_name")} has been on Acme for 2 years. Over that time you've tracked 4.2 million visits and built 36 dashboards.`)}
${offer({
	amount: "1 month",
	label: "of your current plan, free",
	expires: "Applied to your next invoice automatically",
})}
${button("{{{billing_url}}}", "See my billing")}
${text("No code needed and nothing to do. It's just our way of saying thanks.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function bundleHtml(origin: string): string {
	return acmeEmail({
		title: "Save 30% with the Acme Growth bundle",
		preview: "Funnels, Heatmaps, and Session replay together for 30% less.",
		body: `${logo(origin)}
${heading("Get all three add-ons for 30% less")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, the Growth bundle puts Funnels, Heatmaps, and Session replay together at one lower price.`)}
${details([
	{ label: "Funnels", value: "$19.00 / month" },
	{ label: "Heatmaps", value: "$19.00 / month" },
	{ label: "Session replay", value: "$29.00 / month" },
	{
		label: "Growth bundle",
		value: "$46.90 / month",
		note: "Save $20.10 every month",
		strong: true,
	},
])}
${text(`Use code ${v("coupon_code")} at checkout before ${v("offer_expiry")}.`, { marginBottom: 28 })}
${button("{{{offer_url}}}", "Get the bundle")}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function earlyAccessHtml(origin: string): string {
	return acmeEmail({
		title: "Early access to Acme Business",
		preview: "Lock in the early price on our new Business plan.",
		body: `${logo(origin)}
${eyebrow("Early access")}
${heading("Be first on the new Business plan")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we're launching Acme Business on ${v("launch_date")}. As a current customer, you can move over now and keep the early price for as long as you stay.`, 32)}
${step(1, "Unlimited websites", "Track every site and app in one workspace.")}
${step(2, "SSO and audit logs", "Sign in with Okta or Google Workspace and see who changed what.")}
${step(3, "Five-year data retention", "Compare this year with any of the last five.")}
${offer({
	amount: "$99",
	label: "per month, instead of $149 after launch",
	expires: `Early price available until ${v("launch_date")}`,
})}
${button("{{{offer_url}}}", "Claim early access")}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

export const offersTemplates: EmailTemplateExample[] = [
	{
		id: "acme-offer-referral",
		name: "Referral credit",
		slug: "acme-offer-referral",
		category: "offers",
		description:
			"Acme give $50, get $50 referral invite with three simple steps.",
		html: referralHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "referral_link",
				type: "string",
				defaultValue: "acme.example/r/maya",
			},
			{ name: "referral_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-offer-free-add-on",
		name: "Free add-on",
		slug: "acme-offer-free-add-on",
		category: "offers",
		description:
			"Acme offer to try a paid add-on free for three months, with the price after.",
		html: freeAddOnHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 31, 2026" },
			{ name: "offer_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-offer-birthday",
		name: "Birthday discount",
		slug: "acme-offer-birthday",
		category: "offers",
		description:
			"Acme birthday greeting with a one-time 25% coupon for the next month.",
		html: birthdayHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "coupon_code", type: "string", defaultValue: "BDAY25" },
			{ name: "offer_expiry", type: "string", defaultValue: "Nov 14, 2026" },
			{ name: "offer_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-offer-loyalty-reward",
		name: "Loyalty reward",
		slug: "acme-offer-loyalty-reward",
		category: "offers",
		description:
			"Acme anniversary thank-you with a free month applied automatically.",
		html: loyaltyRewardHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-offer-bundle",
		name: "Bundle discount",
		slug: "acme-offer-bundle",
		category: "offers",
		description:
			"Acme add-on bundle offer with a per-item price breakdown and savings.",
		html: bundleHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "coupon_code", type: "string", defaultValue: "GROWTH30" },
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 31, 2026" },
			{ name: "offer_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-offer-early-access",
		name: "Early access plan",
		slug: "acme-offer-early-access",
		category: "offers",
		description:
			"Acme early access to a new plan with a locked-in launch price for existing customers.",
		html: earlyAccessHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "launch_date", type: "string", defaultValue: "Nov 3, 2026" },
			{ name: "offer_url", type: "string", defaultValue: null },
		],
	},
];
