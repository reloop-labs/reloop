"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface DnsProviderNotDetectedProps {
	domain?: string;
}

export const DnsProviderNotDetected = ({
	domain,
}: DnsProviderNotDetectedProps) => {
	return (
		<div>
			{/* Header */}
			<div className="mb-6 flex items-center gap-3">
				<div className="flex size-12 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40">
					<div className="relative">
						<Icon name="globe" className="h-6 w-6 text-text-soft-400" />
						<div className="-top-0.5 -right-0.5 absolute size-2 rounded-full border border-bg-white-0 bg-error-base dark:border-stroke-soft-100/40" />
					</div>
				</div>
				<div>
					<span className="font-semibold text-[10px] text-text-soft-400 uppercase leading-none tracking-wider">
						DNS Provider Scan
					</span>
					<h3 className="font-bold text-lg text-text-strong-950 leading-tight">
						No DNS provider detected
					</h3>
				</div>
			</div>

			{/* Divider */}
			<div className="mb-6 h-px w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />

			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Icon name="globe" className="h-4 w-4 text-text-soft-400" />
					<div className="rounded-lg bg-bg-strong-950 px-3 py-1.5 font-mono text-sm text-text-white-0">
						{domain || "myapp.com"}
					</div>
				</div>

				<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
					We couldn&apos;t detect a supported DNS provider for this domain.
					You&apos;ll need to add the records manually from the table on the
					left.
				</p>

				<div className="h-px w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />

				<div className="space-y-4">
					<span className="font-semibold text-[10px] text-text-soft-400 uppercase leading-none tracking-wider">
						How to do it
					</span>

					<div className="space-y-4">
						{[
							{
								step: 1,
								text: (
									<>
										Log in to your{" "}
										<span className="font-bold">domain registrar</span> or DNS
										host (e.g. GoDaddy, Namecheap)
									</>
								),
							},
							{
								step: 2,
								text: (
									<>
										Go to <span className="font-bold">DNS settings</span> for{" "}
										{domain || "myapp.com"}
									</>
								),
							},
							{
								step: 3,
								text: (
									<>Copy each record from the table and add them one by one</>
								),
							},
						].map((item) => (
							<div key={item.step} className="flex items-start gap-3">
								<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-strong-950 font-bold text-[10px] text-text-white-0">
									{item.step}
								</div>
								<p className="font-medium text-paragraph-sm text-text-sub-600 leading-tight">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						className="w-full"
					>
						<Button.Icon as={Icon} name="arrow-right" />
						<span>View DNS records</span>
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						className="w-full"
					>
						<Button.Icon as={Icon} name="info" />
						<span>How to find my DNS provider</span>
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
