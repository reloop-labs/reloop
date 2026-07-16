import { parseAsString, useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { ConfigureDnsActions } from "./configure-dns-actions";
import { DnsAutoConnectBanner } from "./dns-auto-connect-banner";
import { DnsFeatureSection } from "./dns-feature-section";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DnsRecordSection } from "./dns-record-section";
import { DomainAddedAlert } from "./domain-added-alert";
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

export function ConfigureDnsStep() {
	const [domainId] = useQueryState("domainId", parseAsString.withDefault(""));
	const { data: domainData, isLoading } = useDomainQuery(domainId);
	const { handleUpdateDomain } = useUpdateDomain(domainId, domainData);
	const { isVerifying, verifyDns, skip } = useVerifyDns(domainId);

	const {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	} = groupDomainDnsRecords(domainData?.dnsRecords);

	useHotkeys(
		"mod+enter",
		() => {
			if (!isVerifying) {
				void verifyDns();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys("alt+s", (e) => {
		e.preventDefault();
		skip();
	});

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
				<DomainAddedAlert domainName={domainData?.domain} />
				<div className="mt-6">
					<DnsAutoConnectBanner domain={domainData} domainId={domainId} />
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
					icon="mail-single"
					title="Enable Sending"
					checked={domainData?.isSendingEmailEnabled}
					onCheckedChange={(checked) =>
						handleUpdateDomain(
							{ isSendingEmailEnabled: checked },
							checked
								? "Sending enabled successfully"
								: "Sending disabled successfully",
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

				{receivingRecords.length > 0 && (
					<DnsFeatureSection
						icon="inbox"
						title="Enable Receiving"
						checked={domainData?.isReceivingEmailEnabled}
						onCheckedChange={(checked) =>
							handleUpdateDomain(
								{ isReceivingEmailEnabled: checked },
								checked
									? "Receiving enabled successfully"
									: "Receiving disabled successfully",
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

				{trackingRecords.length > 0 && (
					<DnsFeatureSection
						icon="graph-up"
						title="Tracking"
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
