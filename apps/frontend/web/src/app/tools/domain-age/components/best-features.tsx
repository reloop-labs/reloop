import { cn } from "@reloop/ui/cn";
import { Clock, Globe, ShieldCheck, Server } from "lucide-react";
import type { ComponentType } from "react";

type FeatureItem = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

const FEATURES: FeatureItem[] = [
	{
		icon: ShieldCheck,
		title: "Official RDAP Lookup",
		description: "Queries IANA RDAP endpoints directly — no scraped WHOIS, no rate-limited port 43. Authoritative creation dates.",
	},
	{
		icon: Clock,
		title: "NRD Risk Detection",
		description: "Flags newly registered domains (<30d) that Gmail and Spamhaus treat as high-risk cold senders.",
	},
	{
		icon: Globe,
		title: "SPF / DMARC + MX Check",
		description: "Validates email authentication readiness and mailbox reachability alongside age — age alone isn't enough.",
	},
	{
		icon: Server,
		title: "Registrar & DNS Health",
		description: "Shows registrar, nameserver kind (parking vs production), and status (clientHold, redemption) in one view.",
	},
];

export function BestFeatures() {
	return (
		<section id="best-features" aria-labelledby="best-features-heading" className="w-full">
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">Best features</p>
				<h2 id="best-features-heading" className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white">
					Why check domain age before you send
				</h2>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{FEATURES.map((feature, index) => {
					const borderClass =
						index === 0
							? "border-b sm:border-r lg:border-b-0 lg:border-r"
							: index === 1
								? "border-b sm:border-r-0 lg:border-b-0 lg:border-r"
								: index === 2
									? "border-b sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r"
									: "border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0";

					const IconComponent = feature.icon;

					return (
						<div key={feature.title} className={cn("flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10", borderClass)}>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<span className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base" aria-hidden="true" />
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">{feature.title}</h3>
							</div>

							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">{feature.description}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
