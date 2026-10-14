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
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Inline variable span, e.g. v("first_name") → {{{first_name}}}. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function outForDeliveryHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order arrives today",
		preview: "Your package is out for delivery.",
		body: `${logo(origin)}
${eyebrow("Out for delivery")}
${heading("Your order arrives today")}
${lead(`Hi ${v("first_name")}, order #${v("order_number")} is on the truck and should reach you by ${v("delivery_window")}.`)}
${details([
	{ label: "Carrier", value: "UPS Ground" },
	{ label: "Stops away", value: "6" },
	{ label: "Delivery window", value: v("delivery_window"), strong: true },
])}
${button("{{{tracking_url}}}", "Track live")}
${text("No signature needed. If you won't be home, the driver will leave it at the front door.", { marginBottom: 24 })}
${fallback("{{{tracking_url}}}")}
${footer()}`,
	});
}

function deliveryDelayedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order is running late",
		preview: "A carrier delay pushed your delivery back two days.",
		body: `${logo(origin)}
${heading("Your order is running late")}
${lead(`Sorry, ${v("first_name")}. Order #${v("order_number")} was held up at the carrier's sorting facility. Here's the updated estimate.`)}
${details([
	{ label: "Original estimate", value: "Thursday, Oct 15" },
	{ label: "Reason", value: "Weather delay" },
	{ label: "New estimate", value: v("new_delivery_date"), strong: true },
])}
${button("{{{tracking_url}}}", "Track your package")}
${text("You don't need to do anything. If it hasn't arrived by the new date, reply to this email and we'll send a replacement.", { marginBottom: 24 })}
${fallback("{{{tracking_url}}}")}
${footer()}`,
	});
}

function orderCanceledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order was canceled",
		preview: "Your order was canceled and you won't be charged.",
		body: `${logo(origin)}
${heading(`Order #${v("order_number")} was canceled`)}
${lead(`Hi ${v("first_name")}, we've canceled your order as requested. The hold on your card has been released, so you won't be charged.`)}
${details([
	{ label: "Acme Desk Sensor", note: "Charcoal · Qty 1", value: "$89.00" },
	{ label: "Mounting kit", note: "Qty 1", value: "$9.00" },
	{ label: "Amount charged", value: "$0.00", strong: true },
])}
${button("{{{shop_url}}}", "Continue shopping")}
${text("Your bank may take 3 to 5 business days to remove the pending charge from your statement.", { marginBottom: 24 })}
${fallback("{{{shop_url}}}")}
${footer()}`,
	});
}

function partialShipmentHtml(origin: string): string {
	return acmeEmail({
		title: "Part of your Acme order has shipped",
		preview: "One item is on its way. The rest ships soon.",
		body: `${logo(origin)}
${heading("Part of your order has shipped")}
${lead(`Hi ${v("first_name")}, we didn't want you to wait, so we sent what's in stock from order #${v("order_number")} now. The rest will follow at no extra cost.`)}
${details([
	{ label: "Acme Desk Sensor", note: "Charcoal · Qty 2", value: "Shipped" },
	{
		label: "Mounting kit",
		note: "Qty 2 · Backordered",
		value: v("backorder_date"),
	},
	{ label: "Shipping on the rest", value: "Free", strong: true },
])}
${button("{{{tracking_url}}}", "Track shipped items")}
${text("We'll email you a second tracking link when the mounting kits ship.", { marginBottom: 24 })}
${fallback("{{{tracking_url}}}")}
${footer()}`,
	});
}

function pickupReadyHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order is ready for pickup",
		preview: "Bring your order number and a photo ID.",
		body: `${logo(origin)}
${heading("Your order is ready for pickup")}
${lead(`Hi ${v("first_name")}, order #${v("order_number")} is waiting for you at ${v("store_name")}. We'll hold it until ${v("pickup_deadline")}.`)}
${step(1, "Head to the store", "132 Sample Road, Example City. Open daily, 9 AM to 7 PM.")}
${step(2, "Go to the pickup counter", "It's just inside the entrance, on the left.")}
${step(3, "Show your order number and ID", `Give the team order #${v("order_number")} and a photo ID matching the name on the order.`)}
${button("{{{order_url}}}", "View pickup details")}
${text("Sending someone else? Forward them this email and they can pick it up with their own ID.", { marginBottom: 24 })}
${fallback("{{{order_url}}}")}
${footer()}`,
	});
}

function returnLabelHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme return label is ready",
		preview: "Print your label and drop off the package within 14 days.",
		body: `${logo(origin)}
${heading("Your return label is ready")}
${lead(`Hi ${v("first_name")}, we've started your return for order #${v("order_number")}. Print the prepaid label and drop the package off at any UPS location.`)}
${details([
	{
		label: "Acme Desk Sensor",
		note: "Reason: Didn't fit my setup",
		value: "$89.00",
	},
	{ label: "Return shipping", value: "Free" },
	{ label: "Drop off by", value: v("return_deadline") },
	{ label: "Refund amount", value: "$89.00", strong: true },
])}
${button("{{{label_url}}}", "Print return label")}
${text("Pack the sensor in its original box if you still have it. We'll refund your card within 5 days of receiving it.", { marginBottom: 24 })}
${fallback("{{{label_url}}}")}
${footer()}`,
	});
}

export const ordersTemplates: EmailTemplateExample[] = [
	{
		id: "acme-order-out-for-delivery",
		name: "Out for delivery",
		slug: "acme-order-out-for-delivery",
		category: "orders",
		description: "Acme same-day notice that a package is out for delivery.",
		html: outForDeliveryHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "delivery_window", type: "string", defaultValue: "2 PM to 6 PM" },
			{ name: "tracking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-delivery-delayed",
		name: "Delivery delayed",
		slug: "acme-order-delivery-delayed",
		category: "orders",
		description:
			"Acme apology for a shipping delay with a new delivery estimate.",
		html: deliveryDelayedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{
				name: "new_delivery_date",
				type: "string",
				defaultValue: "Saturday, Oct 17",
			},
			{ name: "tracking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-canceled",
		name: "Order canceled",
		slug: "acme-order-canceled",
		category: "orders",
		description:
			"Acme confirmation that an order was canceled and not charged.",
		html: orderCanceledHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "shop_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-partial-shipment",
		name: "Partial shipment",
		slug: "acme-order-partial-shipment",
		category: "orders",
		description:
			"Acme update when part of an order ships and the rest is backordered.",
		html: partialShipmentHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "backorder_date", type: "string", defaultValue: "Ships Oct 22" },
			{ name: "tracking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-pickup-ready",
		name: "Ready for pickup",
		slug: "acme-order-pickup-ready",
		category: "orders",
		description: "Acme in-store pickup notice with directions and a hold date.",
		html: pickupReadyHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "store_name", type: "string", defaultValue: "Acme Example City" },
			{ name: "pickup_deadline", type: "string", defaultValue: "Oct 21, 2026" },
			{ name: "order_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-return-label",
		name: "Return label",
		slug: "acme-order-return-label",
		category: "orders",
		description:
			"Acme return started email with a prepaid label and refund amount.",
		html: returnLabelHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "return_deadline", type: "string", defaultValue: "Oct 28, 2026" },
			{ name: "label_url", type: "string", defaultValue: null },
		],
	},
];
