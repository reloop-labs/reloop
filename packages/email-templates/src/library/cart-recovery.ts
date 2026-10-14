import {
	acme,
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

/** Inline variable span, e.g. v("first_name") → {{{first_name}}}. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

/** Struck-through old price before the new one. */
function was(price: string): string {
	return `<span style="color:${acme.muted};text-decoration:line-through">${price}</span>&nbsp; `;
}

function cartAbandonedHtml(origin: string): string {
	return acmeEmail({
		title: "You left something in your Acme cart",
		preview: "Your cart is saved and ready when you are.",
		body: `${logo(origin)}
${heading("You left something behind")}
${lead(`Hi ${v("first_name")}, your cart is saved. Pick up where you left off whenever you're ready.`)}
${details([
	{ label: "Acme Desk Sensor", note: "Charcoal · Qty 1", value: "$89.00" },
	{ label: "Mounting kit", note: "Qty 1", value: "$9.00" },
	{ label: "Subtotal", value: "$98.00", strong: true },
])}
${button("{{{cart_url}}}", "Return to cart")}
${text("Free shipping on this order, and free returns for 30 days.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function cartReminderHtml(origin: string): string {
	return acmeEmail({
		title: "Still thinking it over?",
		preview: "Your Acme cart is still waiting for you.",
		body: `${logo(origin)}
${heading("Still thinking it over?")}
${lead(`Hi ${v("first_name")}, your Acme Desk Sensor is still in your cart. Here's what people usually ask before buying.`)}
${step(1, "Does it work without a hub?", "Yes. It connects over Wi-Fi and sets up in about two minutes from the Acme app.")}
${step(2, "How long does the battery last?", "Around 9 months on a single charge with default settings.")}
${step(3, "What if it's not right for me?", "Send it back within 30 days for a full refund. Return shipping is on us.")}
${button("{{{cart_url}}}", "Complete your order")}
${text("Have another question? Reply to this email and a real person will answer.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function cartDiscountHtml(origin: string): string {
	return acmeEmail({
		title: "10% off the items in your cart",
		preview: "A small discount to help you decide. Ends in 48 hours.",
		body: `${logo(origin)}
${heading("A little something to help you decide")}
${lead(`Hi ${v("first_name")}, your cart is about to expire. Here's 10% off if you'd like to finish your order.`)}
${offer({
	amount: "10% off",
	label: "everything in your cart",
	code: v("coupon_code"),
	expires: `Ends ${v("offer_expiry")}`,
})}
${details([
	{
		label: "Acme Desk Sensor",
		note: "Charcoal · Qty 1",
		value: `${was("$89.00")}$80.10`,
	},
	{ label: "Mounting kit", note: "Qty 1", value: `${was("$9.00")}$8.10` },
])}
${button("{{{cart_url}}}", "Use my discount")}
${text("This is the last reminder we'll send about this cart.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function cartPriceDropHtml(origin: string): string {
	return acmeEmail({
		title: "Price drop on an item in your cart",
		preview: "The Acme Desk Sensor is now $74.",
		body: `${logo(origin)}
${eyebrow("Price drop")}
${heading("Good news, the price went down")}
${lead(`Hi ${v("first_name")}, an item in your cart just got cheaper. The new price is already applied.`)}
${details([
	{
		label: "Acme Desk Sensor",
		note: "Charcoal · Qty 1",
		value: `${was("$89.00")}$74.00`,
	},
	{ label: "Mounting kit", note: "Qty 1", value: "$9.00" },
	{ label: "New subtotal", value: "$83.00", strong: true },
])}
${button("{{{cart_url}}}", "View cart")}
${text("Sale prices last while stock does, so we can't promise this one will stick around.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function cartLowStockHtml(origin: string): string {
	return acmeEmail({
		title: "Only a few left of an item in your cart",
		preview: "Your cart isn't reserved, and stock is running low.",
		body: `${logo(origin)}
${heading("Only a few left")}
${lead(`Hi ${v("first_name")}, the ${v("product_name")} in your cart is almost sold out. Items in your cart aren't reserved until you check out.`)}
${details([
	{ label: v("product_name"), note: "Sand · Qty 1", value: "$89.00" },
	{ label: "Left in stock", value: "4", strong: true },
])}
${button("{{{cart_url}}}", "Check out now")}
${text("If it sells out, we'll let you know when it's back so you don't have to keep checking.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function backInStockHtml(origin: string): string {
	return acmeEmail({
		title: "It's back in stock",
		preview: "The item you asked about is available again.",
		body: `${logo(origin)}
${eyebrow("Back in stock")}
${heading(`The ${v("product_name")} is back`)}
${lead(`Hi ${v("first_name")}, you asked us to let you know. It's available again and ships within 1 business day.`)}
${details([
	{ label: v("product_name"), note: "Sand", value: "$89.00" },
	{ label: "Ships", value: "Within 1 business day" },
])}
${button("{{{product_url}}}", "Shop now")}
${text("The last batch sold out in under a week, so don't wait too long.", { marginBottom: 24 })}
${fallback("{{{product_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function checkoutUnfinishedHtml(origin: string): string {
	return acmeEmail({
		title: "Finish your Acme checkout",
		preview: "You're one step away. Your details are saved.",
		body: `${logo(origin)}
${heading("You're one step away")}
${lead(`Hi ${v("first_name")}, you got as far as payment. Your shipping details are saved, so it only takes a moment to finish.`)}
${step(1, "Cart", "Acme Desk Sensor and Mounting kit, $98.00")}
${step(2, "Shipping", "132 Sample Road, Example City · Free standard shipping")}
${step(3, "Payment", "Not completed yet")}
${button("{{{checkout_url}}}", "Finish checkout")}
${text("Had trouble paying? We accept all major cards, Apple Pay, and PayPal. Reply to this email if something went wrong.", { marginBottom: 24 })}
${fallback("{{{checkout_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function browseAbandonedHtml(origin: string): string {
	return acmeEmail({
		title: "Still looking at the Acme Desk Sensor?",
		preview: "Here's a closer look at what you were browsing.",
		body: `${logo(origin)}
${heading("Still have your eye on this?")}
${lead(`Hi ${v("first_name")}, you were looking at the ${v("product_name")} recently. Here's a quick rundown in case it helps.`)}
${details([
	{ label: "Tracks", value: "Temperature, CO₂, noise, light" },
	{ label: "Battery", value: "About 9 months" },
	{ label: "Setup", value: "2 minutes over Wi-Fi" },
	{ label: "Price", value: "$89.00", strong: true },
])}
${button("{{{product_url}}}", "Take another look")}
${text("Free shipping and 30-day returns on every order.", { marginBottom: 24 })}
${fallback("{{{product_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function freeShippingThresholdHtml(origin: string): string {
	return acmeEmail({
		title: "You're $11 away from free shipping",
		preview: "Add one more item to your cart and shipping is on us.",
		body: `${logo(origin)}
${heading("You're $11 away from free shipping")}
${lead(`Hi ${v("first_name")}, orders over $100 ship free. Your cart is at $89, so one small add-on gets you there.`)}
${details([
	{ label: "In your cart", note: "Acme Desk Sensor · Qty 1", value: "$89.00" },
	{ label: "Mounting kit", note: "Popular add-on", value: "+ $9.00" },
	{ label: "Cable organizer", note: "Popular add-on", value: "+ $14.00" },
])}
${button("{{{cart_url}}}", "Add to my cart")}
${text("Shipping on your current cart would be $7.95.", { marginBottom: 24 })}
${fallback("{{{cart_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function upgradeCheckoutAbandonedHtml(origin: string): string {
	return acmeEmail({
		title: "Finish upgrading to Acme Pro",
		preview: "Your Pro checkout is saved. Pick up where you left off.",
		body: `${logo(origin)}
${heading("Finish upgrading to Pro")}
${lead(`Hi ${v("first_name")}, you started upgrading ${v("workspace_name")} to Pro but didn't finish. Your plan selection is saved.`)}
${details([
	{ label: "Pro plan", note: "Monthly · 3 seats", value: "$48.00" },
	{ label: "Events included", value: "1M / month" },
	{ label: "Due today", value: "$48.00", strong: true },
])}
${button("{{{checkout_url}}}", "Complete upgrade")}
${text("Not sure Pro is right for you yet? Reply and we'll help you compare plans, or keep using Free as long as you like.", { marginBottom: 24 })}
${fallback("{{{checkout_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

export const cartRecoveryTemplates: EmailTemplateExample[] = [
	{
		id: "acme-cart-abandoned",
		name: "Abandoned cart",
		slug: "acme-cart-abandoned",
		category: "cart-recovery",
		description:
			"Acme first reminder an hour after a cart is left, with its items.",
		html: cartAbandonedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cart-reminder",
		name: "Cart reminder",
		slug: "acme-cart-reminder",
		category: "cart-recovery",
		description:
			"Acme follow-up a day later that answers common questions before buying.",
		html: cartReminderHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cart-discount",
		name: "Cart discount",
		slug: "acme-cart-discount",
		category: "cart-recovery",
		description: "Acme last nudge with a time-limited discount on the cart.",
		html: cartDiscountHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "coupon_code", type: "string", defaultValue: "COMEBACK10" },
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 16, 2026" },
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cart-price-drop",
		name: "Cart price drop",
		slug: "acme-cart-price-drop",
		category: "cart-recovery",
		description: "Acme alert that an item left in the cart is now cheaper.",
		html: cartPriceDropHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cart-low-stock",
		name: "Cart low stock",
		slug: "acme-cart-low-stock",
		category: "cart-recovery",
		description: "Acme heads-up that an item in the cart is almost sold out.",
		html: cartLowStockHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "product_name",
				type: "string",
				defaultValue: "Acme Desk Sensor",
			},
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-back-in-stock",
		name: "Back in stock",
		slug: "acme-back-in-stock",
		category: "cart-recovery",
		description: "Acme notice that a requested product is available again.",
		html: backInStockHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "product_name",
				type: "string",
				defaultValue: "Acme Desk Sensor",
			},
			{ name: "product_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-checkout-unfinished",
		name: "Unfinished checkout",
		slug: "acme-checkout-unfinished",
		category: "cart-recovery",
		description:
			"Acme reminder for a checkout left at the payment step, showing progress.",
		html: checkoutUnfinishedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "checkout_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-browse-abandoned",
		name: "Browse abandonment",
		slug: "acme-browse-abandoned",
		category: "cart-recovery",
		description:
			"Acme follow-up on a product someone viewed but didn't add to cart.",
		html: browseAbandonedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "product_name",
				type: "string",
				defaultValue: "Acme Desk Sensor",
			},
			{ name: "product_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cart-free-shipping",
		name: "Free shipping threshold",
		slug: "acme-cart-free-shipping",
		category: "cart-recovery",
		description:
			"Acme nudge that a cart is close to free shipping, with suggested add-ons.",
		html: freeShippingThresholdHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "cart_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-upgrade-checkout-abandoned",
		name: "Upgrade checkout abandoned",
		slug: "acme-upgrade-checkout-abandoned",
		category: "cart-recovery",
		description:
			"Acme reminder to finish a plan upgrade checkout that was left open.",
		html: upgradeCheckoutAbandonedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "checkout_url", type: "string", defaultValue: null },
		],
	},
];
