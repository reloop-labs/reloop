"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedClock } from "@fe/dashboard/components/animated-clock";
import { getStatusColorClass, getStatusIcon } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { Domain } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";
import { DeleteDomainModal } from "../../components/delete-domain";
import { useDomainActions } from "../hooks/use-domain-actions";
import { DomainHeaderActions } from "./domain-header-actions";

interface DomainHeaderProps {
	domain?: Domain;
	isLoading?: boolean;
}

export const DomainHeader = ({ domain, isLoading }: DomainHeaderProps) => {
	const { domainId: _domainId } = useParams();
	const domainName = domain?.domain || (_domainId as string);
	const domainRecordId = domain?.id || (_domainId as string);
	const status = domain?.status || "start-verify";
	const lastUpdated = domain?.createdAt;

	const { handleVerifyDNS, isVerifying } = useDomainActions(
		_domainId as string,
		undefined,
	);
	const mutateDomain = () => mutate(`/api/domain/v1/${_domainId}`);
	const router = useRouter();

	return (
		<div className="pt-10">
			<AnimatedBackButton onClick={() => router.push("/domain")} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Domain{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{lastUpdated ? formatRelativeTime(lastUpdated) : "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={`flex items-center gap-1 ${getStatusColorClass(status)}`}
							>
								{status === "verifying" ? (
									<AnimatedClock className="h-3.5 w-3.5" />
								) : (
									<Icon name={getStatusIcon(status)} className="h-3.5 w-3.5" />
								)}
								<p className="font-medium text-paragraph-xs capitalize">
									{status}
								</p>
							</div>
						</div>
					)}
					<h1 className="font-medium text-title-h6 leading-8">{domainName}</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<Skeleton className="h-9 w-32 rounded-lg" />
					) : (
						<>
							{(status === "start-verify" || status === "failed") && (
								<Button.Root
									variant={status === "failed" ? "error" : "neutral"}
									size="xsmall"
									onClick={handleVerifyDNS}
									disabled={isVerifying}
									className="font-medium"
								>
									{status === "failed" ? "Try Again" : "Verify Domain"}
								</Button.Root>
							)}
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() =>
									window.open("https://reloop.sh/docs/domain", "_blank")
								}
								className="gap-1.5 font-medium"
							>
								<Icon name="book-closed" className="h-4 w-4" />
								Docs
								<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
									D
								</span>
							</Button.Root>
							<DomainHeaderActions domainRecordId={domainRecordId} />
						</>
					)}
				</div>
			</div>
			<DeleteDomainModal
				domains={[
					{
						id: domainRecordId || (_domainId as string),
						domain: domainName,
						organizationId: "",
						userId: "",
						domainType: "custom" as const,
						status: "active" as const,
						userVerified: false,
						systemVerified: false,
						customReturnPath: "send",
						clickTracking: false,
						openTracking: false,
						tls: "opportunistic" as const,
						dnsConfigured: false,
						nameservers: null,
						spfRecord: null,
						dkimRecord: null,
						dkimSelector: "reloop",
						dmarcRecord: null,
						dmarcPolicy: "none",
						trackingDomain: false,
						sendingEmail: true,
						receivingEmail: true,
						verificationFailedReason: null,
						deletedAt: null,
						lastVerifiedAt: null,
						createdAt: "",
						updatedAt: "",
					} satisfies Domain,
				]}
				mutate={mutateDomain}
			/>
		</div>
	);
};
