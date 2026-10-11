import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import Link from "next/link";
import { useState } from "react";
import type { DomainResponse } from "#/features/domain/types";
import { useSmtpProviders } from "#/features/smtp/own-smtp/use-smtp-providers";
import { useDomainActions } from "../hooks/use-domain-actions";

const RELOOP = "reloop";

/** Pick whether this domain sends through Reloop or a bring-your-own SMTP relay. */
export function DomainSmtpRelayCard({
	domain,
	domainId,
	isLoading,
}: {
	domain?: DomainResponse;
	domainId?: string;
	isLoading?: boolean;
}) {
	const { handleUpdateDomain } = useDomainActions(domainId, domain);
	const providers = useSmtpProviders();
	const [pending, setPending] = useState(false);

	const items = providers.data?.items ?? [];
	const current = domain?.smtpProviderId ?? null;
	const currentProvider = items.find((p) => p.id === current);

	const onChange = async (value: string) => {
		const next = value === RELOOP ? null : value;
		if (next === current) return;
		setPending(true);
		try {
			await handleUpdateDomain(
				{ smtpProviderId: next },
				next
					? `Now sending through ${items.find((p) => p.id === next)?.name ?? "your SMTP"}`
					: "Now sending through Reloop",
				"Updating delivery route...",
			);
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
			<div className="mb-3 flex items-center gap-2 text-base text-text-strong-950">
				<Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
				<h3 className="font-semibold text-sm">Delivery</h3>
			</div>
			<div className="space-y-4">
				<p className="max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
					Send directly from Reloop's IPs, or relay through your own SMTP
					server. Relaying needs no Reloop DNS records; switching to Reloop adds
					the DNS records you'll need to publish. Later bounces and complaints
					from a relay go to your provider.
				</p>
				{items.length === 0 && !current ? (
					<Link
						href="/smtp"
						className="font-medium text-paragraph-xs text-text-sub-600 underline transition-colors hover:text-text-strong-950"
					>
						Use your own SMTP server
					</Link>
				) : (
					<div className="w-[260px]">
						<Select.Root
							value={current ?? RELOOP}
							onValueChange={(v) => void onChange(v)}
							disabled={isLoading || pending || providers.isPending}
						>
							<Select.Trigger className="w-full">
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value={RELOOP}>Reloop (direct)</Select.Item>
								{items.map((p) => (
									<Select.Item key={p.id} value={p.id}>
										{p.name}
										{p.status === "failing" ? " (failing)" : ""}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
						{currentProvider?.status === "failing" ? (
							<p className="mt-2 text-error-base text-paragraph-xs">
								Last connection test failed. Check the provider in Settings.
							</p>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}
