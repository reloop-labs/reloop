"use client";

import { getRootDomain } from "@fe/dashboard/utils/domain";
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
			<div className="flex items-center gap-2">
				<div className="relative">
					<Icon name="server" className="h-6 w-6 text-text-soft-400" />
					<div className="-top-0.5 -right-0.5 absolute size-2 rounded-full border border-bg-white-0 bg-error-base dark:border-stroke-soft-100/40" />
				</div>
			</div>
			<h3 className="mt-4 mb-1.5 font-bold text-lg text-text-strong-950 leading-tight">
				No DNS provider detected
			</h3>
			<div className="mb-4 flex items-center gap-2">
				<Icon name="globe" className="h-4 w-4 text-text-soft-400" />
				<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-medium text-sm text-text-strong-950">
					{domain}
				</div>
			</div>
			<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
				We couldn&apos;t detect a supported DNS provider for this domain.
				You&apos;ll need to add the records manually from the table on the left.
			</p>
			<div className="mt-3 mb-4 h-px w-full bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
			<div>
				<div className="space-y-4">
					<p className="font-semibold text-text-soft-400 text-xs uppercase leading-none tracking-wider">
						Manual DNS Setup
					</p>
					<ol className="ml-3 list-outside list-decimal space-y-4 font-bold text-paragraph-sm text-text-strong-950">
						{[
							<>
								Log in to your{" "}
								<span className="font-bold">domain registrar</span> or DNS host
								(e.g. GoDaddy, Namecheap)
							</>,
							<>
								Go to <span className="font-bold">DNS settings</span> for{" "}
								{domain || "myapp.com"}
							</>,
							<>Copy each record from the table and add them one by one</>,
						].map((text, idx) => (
							<li key={idx} className="pl-1">
								<span className="font-medium text-text-sub-600 leading-tight">
									{text}
								</span>
							</li>
						))}
					</ol>
				</div>

				<div className="flex flex-col gap-2 pt-4">
					<Button.Root
						asChild
						variant="neutral"
						mode="stroke"
						className="w-full"
					>
						<a
							href={`https://www.whatsmydns.net/dns-lookup?query=${getRootDomain(domain ?? "")}&server=google`}
							target="_blank"
							rel="noreferrer"
						>
							<Button.Icon as={Icon} name="info-outline" className="w-3.5" />
							<span>Find DNS provider</span>
						</a>
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
