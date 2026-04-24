"use client";
import type { DomainNameserversResponse, DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { DomainNotFound } from "../components/domain-not-found";
import { DNSRecordsSection } from "./components/dns-records-section";
import { DomainEvents } from "./components/domain-events";
import { DomainHeader } from "./components/domain-header";
import { DomainStats } from "./components/domain-stats";
import { useClipboard } from "./hooks/use-clipboard";
import { useDomainActions } from "./hooks/use-domain-actions";

const DomainPage = () => {
	const { domainId } = useParams();
	const { copiedItems, copyToClipboard } = useClipboard();

	const {
		data: domainData,
		error,
		isLoading,
		mutate: mutateDomain,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null);

	const { data: nameserverData, isLoading: isLoadingNameservers } =
		useSWR<DomainNameserversResponse>(
			domainId ? `/api/domain/v1/${domainId}/dns` : null,
		);

	const { isVerifying, handleVerifyDNS, handleUpdateDomain } = useDomainActions(
		domainId as string,
		domainData,
	);

	if (error) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<DomainHeader
				domainRecordId={domainData?.id || (domainId as string)}
				domainId={domainData?.domain || (domainId as string)}
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
				lastUpdated={domainData?.createdAt || undefined}
				onVerify={handleVerifyDNS}
				isVerifying={isVerifying}
				mutate={mutateDomain}
			/>

			<DomainStats
				domain={domainData}
				nameservers={nameserverData?.nameservers}
				isLoading={isLoading}
				isLoadingNameservers={isLoadingNameservers}
			/>

			{domainData && (
				<DomainEvents
					domain={domainData}
					nameservers={nameserverData?.nameservers}
				/>
			)}

			<div className="mt-10 mb-4 flex items-center justify-between">
				<p className="font-semibold text-paragraph-lg text-text-strong-950">
					DNS Records
				</p>
			</div>

			<DNSRecordsSection
				domain={domainData}
				isLoading={isLoading}
				handleUpdateDomain={handleUpdateDomain}
				onCopyToClipboard={copyToClipboard}
				copiedItems={copiedItems}
			/>
		</div>
	);
};

export default DomainPage;
