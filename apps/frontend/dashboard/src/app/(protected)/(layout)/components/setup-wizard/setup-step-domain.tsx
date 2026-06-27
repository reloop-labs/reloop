"use client";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { DomainData } from "./use-setup-progress";

export function SetupStepDomain({
	primaryDomain,
	primaryDomainName,
	step2Done,
}: {
	primaryDomain: DomainData | undefined;
	primaryDomainName: string;
	step2Done: boolean;
}) {
	const getBackToUrl = useGetBackToUrl();
	if (step2Done) return null;

	return (
		<>
			<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
				{primaryDomain
					? `Configure DNS settings to verify ${primaryDomainName}`
					: "Verify a domain to send emails from your own address"}
			</span>
			<Link
				href={primaryDomain ? getBackToUrl(`/domain/${primaryDomain.id}`) : getBackToUrl("/domain/add")}
				className="mt-3.5 inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-text-strong-950 px-4.5 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 dark:bg-white dark:text-black"
			>
				{primaryDomain ? "Verify domain" : "Add domain"}
				<ArrowRight className="h-3 w-3" />
			</Link>
		</>
	);
}
