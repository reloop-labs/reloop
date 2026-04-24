"use client";

import type { DomainResponse } from "@reloop/api";
import { Icon } from "@reloop/ui/icon";
import * as React from "react";
import { inferDnsProvider } from "../utils";
import { StatusTimeline } from "./status-timeline";

export const DomainEvents = ({
	domain,
	nameservers,
}: {
	domain: DomainResponse;
	nameservers?: string[] | null;
}) => {
	const providerLabel = React.useMemo(
		() => inferDnsProvider(nameservers || domain.nameservers)?.label,
		[nameservers, domain.nameservers],
	);

	const bannerMessage = () => {
		switch (domain.status) {
			case "verifying":
				return `Propagation via ${providerLabel || "your DNS provider"} may take a few hours`;
			case "active":
				return "DNS records are configured correctly";
			case "failed":
				return "Please review your DNS configuration";
			case "start-verify":
				return "Add the DNS records and click Verify";
			default:
				return "Checking status...";
		}
	};

	return (
		<div className="mt-7 flex flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6">
			{/* Header Status */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1.5">
					<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
						Status Timeline
					</span>
				</div>
				<p className="font-medium text-paragraph-sm text-text-strong-950">
					{bannerMessage()}
				</p>
			</div>

			<StatusTimeline domain={domain} />
		</div>
	);
};
