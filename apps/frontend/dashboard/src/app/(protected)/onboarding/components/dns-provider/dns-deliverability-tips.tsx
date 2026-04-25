"use client";

import * as Accordion from "@reloop/ui/accordion";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

interface TipItem {
	id: string;
	title: string;
	description: string;
	details: string;
	icon: string;
	iconBg: string;
	iconColor: string;
}

const TIPS_DATA: TipItem[] = [
	{
		id: "propagation",
		title: "Propagation can take up to 48 hours",
		description: "Changes don't go live instantly — DNS caches globally.",
		details:
			"After adding records, most providers update within minutes but full global propagation can take up to 48 hours. Use whatsmydns.net to check propagation status by region.",
		icon: "check-circle",
		iconBg: "bg-[#E6F4FE]",
		iconColor: "text-[#2E90FA]",
	},
	{
		id: "spf",
		title: "Only one SPF TXT record per domain",
		description: "Multiple SPF records will break email delivery.",
		details:
			"Merge all SPF entries into one: v=spf1 include:provider1.com include:provider2.com ~all. Two separate SPF records cause validation to fail.",
		icon: "arrow-swap",
		iconBg: "bg-[#ECFDF3]",
		iconColor: "text-[#12B76A]",
	},
	{
		id: "test",
		title: "Test email before going live",
		description: "Use mail-tester.com to catch issues early.",
		details:
			"Send a test email to mail-tester.com — it checks SPF, DKIM, DMARC, and blacklist status before you go live.",
		icon: "barchart",
		iconBg: "bg-[#FEF3F2]",
		iconColor: "text-[#F04438]",
	},
];

export const DnsDeliverabilityTips = () => {
	return (
		<div className="overflow-hidden rounded-[14px] border border-stroke-soft-100/40 bg-bg-weak-50/50">
			<div className="flex items-center gap-1.5 border-stroke-soft-100/40 border-b px-4 py-2">
				<Icon name="bulb" className="h-4 w-4 text-warning-base" />
				<h4 className="font-semibold text-sm text-text-strong-950">Tips</h4>
			</div>

			<Accordion.Root type="single" collapsible className="w-full">
				{TIPS_DATA.map((item) => (
					<Accordion.Item
						key={item.id}
						value={item.id}
						className="group rounded-none border-stroke-soft-100/20 border-b bg-transparent p-0 ring-0 last:border-0"
					>
						<Accordion.Trigger className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 outline-none transition-colors hover:bg-bg-weak-50/50">
							<div
								className={cn(
									"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
									item.iconBg,
								)}
							>
								<Icon
									name={item.icon}
									className={cn("h-3.5 w-3.5", item.iconColor)}
								/>
							</div>
							<div className="flex flex-1 flex-col gap-0.5 text-left">
								<span className="font-semibold text-sm text-text-strong-950 leading-tight">
									{item.title}
								</span>
								<span className="text-[11px] text-text-sub-600 leading-snug">
									{item.description}
								</span>
							</div>
							<Accordion.Arrow
								openIcon="chevron-down"
								closeIcon="chevron-down"
								className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
							/>
						</Accordion.Trigger>
						<Accordion.Content className="px-4 pt-0 pb-2.5 pl-[57px] text-[11px] text-text-sub-600 leading-relaxed">
							{item.details}
						</Accordion.Content>
					</Accordion.Item>
				))}
			</Accordion.Root>
		</div>
	);
};
