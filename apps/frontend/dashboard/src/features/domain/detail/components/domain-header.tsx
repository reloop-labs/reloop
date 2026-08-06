import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useHotkeys } from "react-hotkeys-hook";
import { ForwardDNSRecordsButton } from "../../add/setup/components/forward-dns-records";
import { DeleteDomainModal } from "../../components/delete-domain";
import { DomainAvatar } from "../../components/domain-avatar";
import type { Domain } from "../../types";
import { useDomainActions } from "../hooks/use-domain-actions";
import { DomainHeaderActions } from "./domain-header-actions";

export function DomainHeader({
	domain,
	domainId,
	isLoading,
}: {
	domain?: Domain;
	domainId?: string;
	isLoading?: boolean;
}) {
	const domainName = domain?.domain || domainId || "Domain";
	const domainRecordId = domain?.id || domainId || "";
	const status = domain?.status || "pending";

	const { handleVerifyDNS, isVerifying } = useDomainActions(
		domainRecordId,
		domain as never,
	);

	useHotkeys(
		"mod+v",
		(e) => {
			e.preventDefault();
			if (status === "pending" || status === "failed") {
				void handleVerifyDNS();
			}
		},
		{ enableOnFormTags: true },
		[status, handleVerifyDNS],
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/domains", "_blank");
		},
		{ enableOnFormTags: true },
	);

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-12 w-12 shrink-0 rounded-[14px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<Skeleton className="h-4 w-14 rounded-full" />
								<Skeleton className="h-6 w-48 rounded-lg" />
							</div>
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-3">
							<DomainAvatar
								seed={domainRecordId || domainName}
								size="lg"
								alt={`${domainName} avatar`}
							/>
							<div className="min-w-0">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Domain
								</p>
								<h1 className="mb-0.5 font-semibold text-title-h6 leading-5">
									{domainName}
								</h1>
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<Skeleton className="h-9 w-32 rounded-lg" />
					) : (
						<>
							{(status === "pending" ||
								status === "verifying" ||
								status === "failed") && (
								<>
									{domainRecordId && (
										<ForwardDNSRecordsButton domainId={domainRecordId} />
									)}
									<FancyButton.Root
										variant="blue"
										size="xsmall"
										onClick={() => void handleVerifyDNS()}
										disabled={isVerifying || status === "verifying"}
										className="font-medium"
									>
										{isVerifying || status === "verifying"
											? "Verifying..."
											: status === "failed"
												? "Try Again"
												: "Verify Domain"}
									</FancyButton.Root>
								</>
							)}
							<DomainHeaderActions
								domain={domain}
								domainRecordId={domainRecordId}
							/>
						</>
					)}
				</div>
			</div>
			{domain && <DeleteDomainModal domains={[domain]} />}
		</div>
	);
}
