import { formatPrice, pricingPlans } from "@reloop/pricing";

/** Structured pricing markdown for agents (`/pricing.md`). */
export function buildPricingMarkdown(): string {
	const lines: string[] = [
		"# Pricing — Reloop",
		"",
		"> Scale your email. Control your costs. Hosted Reloop or self-host.",
		"> HTML page: https://reloop.sh/pricing",
		"",
		"## Plans",
		"",
	];

	for (const plan of pricingPlans) {
		const price =
			plan.monthlyPrice === null
				? "Custom"
				: plan.monthlyPrice === 0
					? "$0 / month"
					: `${formatPrice(plan.monthlyPrice)} / month`;

		lines.push(`### ${plan.name}`);
		lines.push("");
		lines.push(`- Price: ${price}`);
		if (plan.priceSubline) lines.push(`- Note: ${plan.priceSubline}`);
		lines.push(`- Description: ${plan.description}`);
		lines.push(`- Emails: ${plan.emailsLabel}`);
		if (plan.extraEmailsLabel) {
			lines.push(`- Overage: ${plan.extraEmailsLabel}`);
		}
		lines.push(`- CTA: ${plan.ctaLabel} → ${plan.ctaHref}`);
		lines.push("- Features:");
		for (const f of plan.features) {
			lines.push(`  - ${f}`);
		}
		lines.push("");
	}

	lines.push(
		"## Self-host",
		"",
		"Self-hosting the open-source Reloop stack is free (infrastructure costs are yours).",
		"See https://reloop.sh/docs/self-host",
		"",
		"## Related",
		"",
		"- Signup: https://reloop.sh/dashboard/signup",
		"- Docs: https://reloop.sh/docs/llms.txt",
		"- Contact sales: https://reloop.sh/contact",
		"",
	);

	return lines.join("\n");
}
