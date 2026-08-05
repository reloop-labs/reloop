import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { parseAsString, useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { isForwardRecordsSequence } from "#/features/domain/add/setup/components/forward-records-shortcut";
import { useDomainConnectCallback } from "#/features/domain/hooks/use-domain-connect-callback";
import { onboardingStepParser } from "../onboarding-step";
import { ConfigureDnsActions } from "./configure-dns-actions";
import { DnsAutoConnectBanner } from "./dns-auto-connect-banner";
import { DnsFeatureSection } from "./dns-feature-section";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DnsRecordSection } from "./dns-record-section";
import { useDomainQuery } from "./use-domain-query";
import { useUpdateDomain } from "./use-update-domain";
import { useVerifyDns } from "./use-verify-dns";

async function copyToClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		// ignore clipboard errors
	}
}

function TwitterVerifiedIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className ?? "size-6 shrink-0 text-text-sub-600"}
			fill="currentColor"
		>
			<path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.71 4.29l-3.58-3.59 1.41-1.41 2.17 2.17 6.18-6.18 1.41 1.41-7.59 7.6z" />
		</svg>
	);
}

export function ConfigureDnsStep() {
	const [domainId] = useQueryState("domainId", parseAsString.withDefault(""));
	const [, setStep] = useQueryState("step", onboardingStepParser);
	const { data: domainData, isLoading } = useDomainQuery(domainId);
	const { handleUpdateDomain } = useUpdateDomain(domainId, domainData);
	const { isVerifying, verifyDns, skip } = useVerifyDns(domainId);

	useDomainConnectCallback({
		onSuccess: () => {
			void setStep(4);
		},
	});

	const {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	} = groupDomainDnsRecords(domainData?.dnsRecords);

	// Enter verifies DNS; ⌥S skips — same pattern as Add Domain.
	useHotkeys(
		"enter",
		(e) => {
			// Don't steal Enter from the forward-records email field.
			const target = e.target;
			if (
				target instanceof HTMLElement &&
				(target.closest("[data-radix-popper-content-wrapper]") ||
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA")
			) {
				return;
			}
			e.preventDefault();
			if (!isVerifying) {
				void verifyDns();
			}
		},
		{ enableOnFormTags: false, preventDefault: true },
		[isVerifying, verifyDns],
	);

	useHotkeys(
		"alt+s",
		(e) => {
			e.preventDefault();
			if (!isVerifying) {
				skip();
			}
		},
		{ enableOnFormTags: true },
		[isVerifying, skip],
	);

	const hasReceiving = receivingRecords.length > 0;
	const hasTracking = trackingRecords.length > 0;
	const sendingEnabled = Boolean(domainData?.isSendingEmailEnabled);
	const receivingEnabled = Boolean(domainData?.isReceivingEmailEnabled);
	const trackingEnabled = Boolean(
		domainData?.isClickTrackingEnabled || domainData?.isOpenTrackingEnabled,
	);

	// S / R / T — toggle sending, receiving, tracking (hints via long-press Space).
	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			if (!domainData) return;
			const next = !sendingEnabled;
			void handleUpdateDomain(
				{ isSendingEmailEnabled: next },
				next
					? "Sending enabled successfully"
					: "Sending disabled successfully",
				next ? "Enabling email sending..." : "Disabling email sending...",
			);
		},
		{ enableOnFormTags: false, preventDefault: true, enabled: !!domainData },
		[domainData, sendingEnabled, handleUpdateDomain],
	);

	useHotkeys(
		"r",
		(e) => {
			// F→R is reserved for "Forward records" — don't toggle receiving mid-sequence.
			if (isForwardRecordsSequence()) return;

			e.preventDefault();
			if (!domainData || !hasReceiving) return;
			const next = !receivingEnabled;
			void handleUpdateDomain(
				{ isReceivingEmailEnabled: next },
				next
					? "Receiving enabled successfully"
					: "Receiving disabled successfully",
				next
					? "Enabling email receiving..."
					: "Disabling email receiving...",
			);
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
			enabled: !!domainData && hasReceiving,
		},
		[domainData, hasReceiving, receivingEnabled, handleUpdateDomain],
	);

	useHotkeys(
		"t",
		(e) => {
			e.preventDefault();
			if (!domainData || !hasTracking) return;
			const next = !trackingEnabled;
			void handleUpdateDomain(
				{
					isClickTrackingEnabled: next,
					isOpenTrackingEnabled: next,
				},
				next
					? "Tracking enabled successfully"
					: "Tracking disabled successfully",
			);
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
			enabled: !!domainData && hasTracking,
		},
		[domainData, hasTracking, trackingEnabled, handleUpdateDomain],
	);

	if (!domainId && !isLoading) {
		return (
			<div>
				<p className="text-text-sub-600 outline-none">
					Please add a domain in the previous step.
				</p>
			</div>
		);
	}

	return (
		<div className="pb-10">
			<div className="relative mx-auto mb-8 flex flex-col">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							{domainData?.domain || (
								<Skeleton className="h-8 w-48 rounded-lg" />
							)}
						</h1>
						{domainData?.domain && (
							<TwitterVerifiedIcon className="size-[18px] shrink-0 text-text-sub-600" />
						)}
					</div>
					<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
						Domain added · Copy the records below and add them to your DNS
						provider to start sending emails.
					</p>
				</div>
				<div className="mt-6">
					<DnsAutoConnectBanner
						domain={domainData}
						domainId={domainId || domainData?.id}
						forceShow
					/>
				</div>

				<DnsFeatureSection
					icon="shield"
					title="Domain Verification"
					showToggle={false}
				>
					{dkimRecords.length > 0 && (
						<DnsRecordSection
							title="DKIM"
							records={dkimRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							loadingRows={1}
							docsUrl="https://reloop.sh/docs/dns/dkim"
						/>
					)}
				</DnsFeatureSection>

				<DnsFeatureSection
					icon="mail-send"
					title="Email Sending"
					shortcut="S"
					checked={domainData?.isSendingEmailEnabled}
					onCheckedChange={(checked) =>
						handleUpdateDomain(
							{ isSendingEmailEnabled: checked },
							checked
								? "Sending enabled successfully"
								: "Sending disabled successfully",
							checked
								? "Enabling email sending..."
								: "Disabling email sending...",
						)
					}
				>
					<div className="space-y-6">
						<DnsRecordSection
							title="SPF"
							records={sendingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							loadingRows={1}
							docsUrl="https://reloop.sh/docs/dns/spf"
						/>
						{dmarcRecords.length > 0 && (
							<DnsRecordSection
								loadingRows={2}
								title="DMARC (Optional)"
								records={dmarcRecords}
								onCopyToClipboard={copyToClipboard}
								isLoading={isLoading}
								docsUrl="https://reloop.sh/docs/dns/dmarc"
								className="mt-7"
							/>
						)}
					</div>
				</DnsFeatureSection>

				{hasReceiving && (
					<DnsFeatureSection
						icon="mail-receive"
						title="Email Receiving"
						shortcut="R"
						checked={domainData?.isReceivingEmailEnabled}
						onCheckedChange={(checked) =>
							handleUpdateDomain(
								{ isReceivingEmailEnabled: checked },
								checked
									? "Receiving enabled successfully"
									: "Receiving disabled successfully",
								checked
									? "Enabling email receiving..."
									: "Disabling email receiving...",
							)
						}
					>
						<DnsRecordSection
							title="MX"
							records={receivingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							loadingRows={1}
							docsUrl="https://reloop.sh/docs/dns/mx"
						/>
					</DnsFeatureSection>
				)}

				{hasTracking && (
					<DnsFeatureSection
						icon="graph-up"
						title="Tracking"
						shortcut="T"
						checked={
							domainData?.isClickTrackingEnabled ||
							domainData?.isOpenTrackingEnabled
						}
						onCheckedChange={(checked) =>
							handleUpdateDomain(
								{
									isClickTrackingEnabled: checked,
									isOpenTrackingEnabled: checked,
								},
								checked
									? "Tracking enabled successfully"
									: "Tracking disabled successfully",
							)
						}
					>
						<DnsRecordSection
							title="CNAME"
							records={trackingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							loadingRows={1}
							docsUrl="https://reloop.sh/docs/dns/cname"
						/>
					</DnsFeatureSection>
				)}

				<ConfigureDnsActions
					domainId={domainId || domainData?.id}
					isVerifying={isVerifying}
					onSkip={skip}
					onVerify={() => {
						void verifyDns();
					}}
				/>
			</div>
		</div>
	);
}
