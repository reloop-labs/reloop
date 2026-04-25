"use client";

import { Icon } from "@reloop/ui/icon";

export const DnsDeliverabilityTips = () => {
	return (
		<div className="overflow-hidden rounded-[14px] border border-stroke-soft-100/40 bg-bg-weak-50/50">
			<div className="flex items-center gap-2 px-4 pt-4 font-medium">
				<Icon name="bulb" className="h-3.5 w-3.5 text-warning-base" />
				<h4 className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider">
					Quick Tips
				</h4>
			</div>
			<div className="space-y-4 p-5">
				{[
					{
						title: "Conversion",
						desc: "Verified domains get 80% higher open rates.",
					},
					{
						title: "Authentication",
						desc: "Set SPF & DKIM to avoid spam filters.",
					},
					{
						title: "Reputation",
						desc: "Use subdomains for higher sender scores.",
					},
				].map((item, idx) => (
					<div key={idx} className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-text-strong-950" />
							<span className="font-bold text-[10px] text-text-strong-950 uppercase tracking-wider">
								{item.title}
							</span>
						</div>
						<p className="pl-3 text-paragraph-sm text-text-sub-600 leading-snug">
							{item.desc}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};
