"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import type { DomainNameserversResponse, DomainResponse } from "@reloop/api";
import axios from "axios";
import { useParams } from "next/navigation";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSRecordsSection } from "./components/DNSRecordsSection";
import { DomainHeader } from "./components/DomainHeader";
import { StatusBanner } from "./components/StatusBanner";
import { groupDomainDnsRecords } from "./components/dns-record-groups";

const inferDnsProvider = (nameservers: string[] | null | undefined) => {
	if (!nameservers?.length) return null;

	const normalized = nameservers.map((server) => server.toLowerCase());

	if (normalized.some((server) => server.includes("cloudflare.com"))) {
		return { label: "Cloudflare", iconKey: "siCloudflare" };
	}
	if (normalized.some((server) => server.includes("awsdns-"))) {
		return { label: "AWS", iconKey: "siAmazonwebservices" };
	}
	if (normalized.some((server) => server.includes("vercel-dns.com"))) {
		return { label: "Vercel", iconKey: "siVercel" };
	}
	if (normalized.some((server) => server.includes("digitalocean.com"))) {
		return { label: "DigitalOcean", iconKey: "siDigitalocean" };
	}
	if (normalized.some((server) => server.includes("domaincontrol.com"))) {
		return { label: "GoDaddy", iconKey: "siGodaddy" };
	}
	if (normalized.some((server) => server.includes("registrar-servers.com"))) {
		return { label: "Namecheap", iconKey: "siNamecheap" };
	}

	return null;
};

const DomainPage = () => {
	const { domainId } = useParams();
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const [isVerifying, setIsVerifying] = React.useState(false);
	const [isUpdatingSending, setIsUpdatingSending] = React.useState(false);
	const [isUpdatingReceiving, setIsUpdatingReceiving] = React.useState(false);

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null);
	const { data: nameserverData, isLoading: isLoadingNameservers } =
		useSWR<DomainNameserversResponse>(
			domainId ? `/api/domain/v1/${domainId}/dns` : null,
		);

	const copyToClipboard = async (text: string, itemId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedItems((prev) => new Set(prev).add(itemId));
			setTimeout(() => {
				setCopiedItems((prev) => {
					const newSet = new Set(prev);
					newSet.delete(itemId);
					return newSet;
				});
			}, 2000);
		} catch {
			// Handle copy error silently
		}
	};

	const handleVerifyDNS = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			// Trigger Inngest workflow for background verification
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});

			// Refresh domain data to get "verifying" status
			await mutate(`/api/domain/v1/${domainId}`);

			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleUpdateDomain = async (
		payload: Partial<Pick<DomainResponse, "sendingEmail" | "receivingEmail">>,
		setUpdating: React.Dispatch<React.SetStateAction<boolean>>,
		successMessage: string,
	) => {
		if (!domainId || !domainData) {
			toast.error("Domain information not available");
			return;
		}

		const cacheKey = `/api/domain/v1/${domainId}`;
		const optimisticData = { ...domainData, ...payload };

		setUpdating(true);
		await mutate(cacheKey, optimisticData, false);

		try {
			const { data } = await axios.patch<DomainResponse>(
				`/api/domain/v1/${domainId}`,
				payload,
				{ headers: { credentials: "include" } },
			);

			await mutate(cacheKey, data, false);
			toast.success(successMessage);
		} catch (error) {
			await mutate(cacheKey);
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to update domain settings"
				: "Failed to update domain settings";
			toast.error(errorMessage);
		} finally {
			setUpdating(false);
		}
	};

	const { sendingRecords, receivingRecords, dmarcRecords } =
		groupDomainDnsRecords(domainData?.dnsRecords);
	const dnsProvider = inferDnsProvider(nameserverData?.nameservers);
	const dnsIcon = dnsProvider
		? ((simpleIcons as Record<string, { svg: string; hex: string }>)[
				dnsProvider.iconKey
			] ?? null)
		: null;

	if (error) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<DomainHeader domainId={domainId as string} status="failed" isFailed />
				<div className="pt-20">
					<SomethingWentWrong
						errorType="server"
						title="Failed to Load Domain Information"
						description="We couldn't load the domain information. This might be due to a temporary server issue or network problem."
						onRetry={() => mutate(`/api/domain/v1/${domainId}`)}
						refreshText="Reload Page"
						onRefresh={() => window.location.reload()}
					/>
				</div>
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
			/>
			<StatusBanner
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
			/>
			<div className="mt-4 rounded-2xl border border-stroke-soft-200 p-5 shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset">
				<div className="mb-3">
					<div className="flex items-center gap-2">
						<div className="font-medium text-sm text-text-strong-950">
							Nameservers
						</div>
						{dnsProvider && dnsIcon && (
							<div className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 text-xs text-text-sub-600">
								<span
									className="h-3.5 w-3.5"
									style={{ color: `#${dnsIcon.hex}` }}
									dangerouslySetInnerHTML={{ __html: dnsIcon.svg }}
								/>
								<span>{dnsProvider.label}</span>
							</div>
						)}
					</div>
					<div className="text-paragraph-sm text-text-sub-600">
						Current nameservers detected for this domain.
					</div>
				</div>
				{isLoadingNameservers ? (
					<div className="text-paragraph-sm text-text-sub-600">
						Loading nameservers...
					</div>
				) : nameserverData?.nameservers?.length ? (
					<div className="space-y-2">
						{nameserverData.nameservers.map((nameserver, index) => (
							<button
								key={`${nameserver}-${index}`}
								type="button"
								onClick={() =>
									copyToClipboard(nameserver, `nameserver-${index}`)
								}
								className="flex w-full items-center justify-between rounded-xl border border-stroke-soft-200 px-3 py-2 text-left transition-colors hover:bg-bg-weak-50/50"
							>
								<span className="font-mono text-label-sm text-text-strong-950">
									{nameserver}
								</span>
								<span className="text-text-sub-600 text-xs">
									{copiedItems.has(`nameserver-${index}`) ? "Copied" : "Copy"}
								</span>
							</button>
						))}
					</div>
				) : (
					<div className="text-paragraph-sm text-text-sub-600">
						No nameservers found for this domain yet.
					</div>
				)}
			</div>
			<div className="my-9">
				<div className="w-full border-stroke-soft-200 border-t border-dashed" />
			</div>
			<DNSRecordsSection
				sendingRecords={sendingRecords}
				receivingRecords={receivingRecords}
				dmarcRecords={dmarcRecords}
				sendingEmail={domainData?.sendingEmail}
				receivingEmail={domainData?.receivingEmail}
				onToggleSending={(value) =>
					handleUpdateDomain(
						{ sendingEmail: value },
						setIsUpdatingSending,
						`Sending email ${value ? "enabled" : "disabled"}`,
					)
				}
				onToggleReceiving={(value) =>
					handleUpdateDomain(
						{ receivingEmail: value },
						setIsUpdatingReceiving,
						`Receiving email ${value ? "enabled" : "disabled"}`,
					)
				}
				isUpdatingSending={isUpdatingSending}
				isUpdatingReceiving={isUpdatingReceiving}
				onCopyToClipboard={copyToClipboard}
				copiedItems={copiedItems}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default DomainPage;
