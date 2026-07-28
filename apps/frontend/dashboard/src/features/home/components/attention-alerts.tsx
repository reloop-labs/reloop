import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { DomainStatus } from "#/features/domain/types";

export type AttentionItem = {
	id: string;
	status: "warning" | "error" | "information";
	title: string;
	description: string;
	href: string;
	cta: string;
};

export function buildAttentionItems({
	domains,
	bounceRate,
	usageRatio,
}: {
	domains: { id: string; domain: string; status: DomainStatus }[];
	bounceRate: number | null;
	usageRatio: number | null;
}): AttentionItem[] {
	const items: AttentionItem[] = [];

	const problemDomains = domains.filter((d) =>
		["pending", "failed", "suspended", "verifying"].includes(d.status),
	);

	if (problemDomains.length > 0) {
		const first = problemDomains[0]!;
		const failed = problemDomains.filter(
			(d) => d.status === "failed" || d.status === "suspended",
		);
		const pending = problemDomains.filter(
			(d) => d.status === "pending" || d.status === "verifying",
		);

		if (failed.length > 0) {
			items.push({
				id: "domain-failed",
				status: "error",
				title:
					failed.length === 1
						? `${failed[0]!.domain} needs attention`
						: `${failed.length} domains need attention`,
				description:
					"Verification failed or the domain is suspended. Fix DNS or contact support to restore sending.",
				href: `/domain/${first.id}`,
				cta: "Review domain",
			});
		} else if (pending.length > 0) {
			items.push({
				id: "domain-pending",
				status: "warning",
				title:
					pending.length === 1
						? `Finish verifying ${pending[0]!.domain}`
						: `Finish verifying ${pending.length} domains`,
				description:
					"Add the required DNS records, then verify. Sending works best from an active domain.",
				href: `/domain/${pending[0]!.id}`,
				cta: "Configure DNS",
			});
		}
	}

	if (bounceRate != null && bounceRate >= 4) {
		items.push({
			id: "bounce-rate",
			status: bounceRate >= 8 ? "error" : "warning",
			title: `Bounce rate is ${bounceRate.toFixed(1)}%`,
			description:
				"A high bounce rate hurts deliverability. Check recent failures and suppress invalid addresses.",
			href: "/metrics",
			cta: "View metrics",
		});
	}

	if (usageRatio != null && usageRatio >= 0.8) {
		items.push({
			id: "usage",
			status: usageRatio >= 1 ? "error" : "warning",
			title:
				usageRatio >= 1
					? "You have used all of this period’s credits"
					: `You have used ${Math.round(usageRatio * 100)}% of this period’s credits`,
			description:
				"Upgrade your plan or wait for the next billing period to avoid interruptions.",
			href: "/settings/billing",
			cta: "View billing",
		});
	}

	return items.slice(0, 3);
}

export function AttentionAlerts({ items }: { items: AttentionItem[] }) {
	if (items.length === 0) return null;

	return (
		<div className="space-y-3">
			{items.map((item) => (
				<Alert.Root
					key={item.id}
					variant="lighter"
					status={item.status}
					size="large"
					className="rounded-2xl ring-1 ring-stroke-soft-200 ring-inset"
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 space-y-0.5">
							<div className="font-medium text-label-md text-text-strong-950">
								{item.title}
							</div>
							<p className="text-paragraph-sm text-text-sub-600">
								{item.description}
							</p>
						</div>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							asChild
							className="shrink-0 gap-1.5 rounded-xl"
						>
							<Link href={item.href}>
								{item.cta}
								<Icon name="arrow-right" className="h-3.5 w-3.5" />
							</Link>
						</Button.Root>
					</div>
				</Alert.Root>
			))}
		</div>
	);
}
