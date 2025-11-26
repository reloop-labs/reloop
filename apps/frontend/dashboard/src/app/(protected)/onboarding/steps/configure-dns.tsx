"use client";

import * as Button from "@reloop/ui/button";
import { Copy } from "lucide-react";

export const ConfigureDnsStep = () => {
	const records = [
		{
			type: "TXT",
			name: "@",
			value: "v=spf1 include:mailinfra.com ~all",
		},
		{
			type: "CNAME",
			name: "mte1._domainkey",
			value: "dkim.mailinfra.com",
		},
	];

	return (
		<div className="fade-in animate-in duration-500">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-text-strong-950">
					DNS Configuration
				</h3>
				<span className="rounded-full bg-warning-lighter px-2 py-1 font-medium text-text-strong-950 text-xs">
					Pending Verification
				</span>
			</div>

			<div className="space-y-3">
				{records.map((record, idx) => (
					<div
						key={idx}
						className="group rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4 transition-colors hover:border-primary-base"
					>
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-bold font-mono text-text-sub-600 text-xs">
									{record.type}
								</span>
								<span className="font-medium text-sm text-text-strong-950">
									{record.name}
								</span>
							</div>
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="xsmall"
								className="opacity-0 transition-opacity group-hover:opacity-100"
							>
								<Copy size={16} />
							</Button.Root>
						</div>
						<div className="break-all rounded border border-stroke-soft-100 bg-bg-white-0 p-2 font-mono text-text-sub-600 text-xs">
							{record.value}
						</div>
					</div>
				))}
			</div>
			<p className="mt-4 text-text-sub-600 text-xs">
				It may take up to 48 hours for DNS changes to propagate, although it's
				usually much faster.
			</p>
		</div>
	);
};
