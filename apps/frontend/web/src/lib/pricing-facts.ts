import { formatPrice, planLimits, pricingPlans } from "@reloop/pricing";

const free = planLimits.free;

export const freeMonthlyEmails = free.monthlyEmails.toLocaleString("en-US");
export const freeDailyEmails = String(free.dailyEmailLimit);
export const freePlanSummary = `${freeMonthlyEmails} emails/month (${freeDailyEmails}/day)`;

function planPrice(monthlyPrice: number | null): string {
	if (monthlyPrice === null) return "Custom";
	return `${formatPrice(monthlyPrice)}/month`;
}

function planVolume(plan: (typeof pricingPlans)[number]): string {
	return plan.monthlyPrice === null
		? "custom volume"
		: `${plan.comparison.monthlyEmails} emails`;
}

function planDailyCap(plan: (typeof pricingPlans)[number]): string {
	return plan.comparison.dailyLimit === "No limit"
		? "no daily cap"
		: `${plan.comparison.dailyLimit}/day`;
}

export function hostedPlansSentence(): string {
	const parts = pricingPlans.map((plan) => {
		const price =
			plan.monthlyPrice === 0 ? "" : ` ${planPrice(plan.monthlyPrice)}`;
		return `${plan.name}${price} (${planVolume(plan)}, ${planDailyCap(plan)})`;
	});
	return `Hosted Reloop Cloud plans: ${parts.join(", ")}.`;
}

export function pricingSnapshotMarkdown(): string {
	const rows = pricingPlans.map((plan) => {
		const price =
			plan.monthlyPrice === null
				? "Custom"
				: plan.monthlyPrice === 0
					? "$0"
					: `${formatPrice(plan.monthlyPrice)} / month`;
		const volume =
			plan.monthlyPrice === null
				? "Custom"
				: `${plan.comparison.monthlyEmails} emails / month`;
		const daily =
			plan.comparison.dailyLimit === "No limit"
				? "None"
				: `${plan.comparison.dailyLimit} / day`;
		return `| ${plan.name} | ${price} | ${volume} | ${daily} |`;
	});
	const overage =
		pricingPlans.find((plan) => plan.extraEmailsLabel)?.extraEmailsLabel ?? "";
	return [
		"| Plan | Price | Volume | Daily cap |",
		"|------|-------|--------|-----------|",
		...rows,
		"",
		`Paid overage: ${overage.replace(/^Extra emails:\s*/, "")}. Free has no overage: sending pauses at ${freeMonthlyEmails} emails / month or ${freeDailyEmails} / day. Self-host: no Reloop license fee. Full tables: [pricing.md](https://reloop.sh/pricing.md)`,
	].join("\n");
}
