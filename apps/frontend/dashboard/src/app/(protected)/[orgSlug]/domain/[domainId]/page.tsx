"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { DomainNameserversResponse, DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useParams } from "next/navigation";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSRecordsSection } from "./components/DNSRecordsSection";
import { DomainHeader } from "./components/DomainHeader";
import { groupDomainDnsRecords } from "./components/dns-record-groups";
import { DomainEvents } from "./components/domain-events";

const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "active":
			return "border border-success-base text-success-base bg-success-light/20";
		case "suspended":
		case "failed":
			return "border border-error-base text-error-base bg-error-light/20";
		case "verifying":
			return "border border-warning-base text-warning-base bg-warning-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

const formatStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case "start-verify":
			return "Pending";
		default:
			return status.charAt(0).toUpperCase() + status.slice(1);
	}
};

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

	// Fallback: extract domain name from the first nameserver (e.g., ns.udag.org -> Udag)
	let fallbackLabel = normalized[0] || "Unknown";
	try {
		const parts = fallbackLabel.split(".");
		if (parts.length >= 2) {
			let name = parts[parts.length - 2];
			// basic attempt to skip tlds like co.uk
			if (name === "co" || name === "com" || name === "org" || name === "net") {
				name = parts[parts.length - 3] || parts[parts.length - 2];
			}
			if (name) {
				fallbackLabel = name.charAt(0).toUpperCase() + name.slice(1);
			}
		}
	} catch {
		// Ignore any parsing errors
	}

	return { label: fallbackLabel, iconKey: null as string | null };
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

	const dnsIcon = dnsProvider?.iconKey
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
				<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
					{/* Created */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Created
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{domainData?.createdAt
									? formatRelativeTime(domainData.createdAt)
									: "---"}
							</span>
						)}
					</div>

					{/* Status */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Status
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-20 rounded-lg" />
						) : (
							<span
								className={cn(
									"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
									getStatusBadgeStyles(domainData?.status || "start-verify"),
								)}
							>
								{formatStatusLabel(domainData?.status || "start-verify")}
							</span>
						)}
					</div>

					{/* Provider */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="server" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Provider
							</span>
						</div>
						{isLoading || isLoadingNameservers ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<div className="mt-0.5 flex items-center gap-1.5">
								{dnsProvider ? (
									<div className="flex items-center gap-1.5 text-sm text-text-strong-950">
										{dnsIcon && (
											<span
												className="h-4 w-4"
												style={{ color: `#${dnsIcon.hex}` }}
												// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted SVG from simple-icons
												dangerouslySetInnerHTML={{ __html: dnsIcon.svg }}
											/>
										)}
										<span className="font-medium text-paragraph-sm underline decoration-stroke-soft-200 decoration-dashed underline-offset-4">
											{dnsProvider.label}
										</span>
									</div>
								) : (
									<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
										Unknown
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				{domainData && (
					<DomainEvents
						domain={domainData}
						providerLabel={dnsProvider?.label}
					/>
				)}

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
		</div>
	);
};

export default DomainPage;
