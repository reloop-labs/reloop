"use client";
import type { DNSRecord, DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useUserOrganization } from "src/providers/org-provider";
import useSWR from "swr";
import { Globe } from "../../globe";

const NewDomainPage = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const { push } = useUserOrganization();
	const { domainId } = useParams();
	const { back } = useRouter();
	console.log("🚀 ~ NewDomainPage ~ domainId:", domainId);

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});
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
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex h-96 items-center justify-center">
					<Spinner />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
					<div>
						<h1 className="font-medium text-title-h5 leading-8">Add Domain</h1>
						<p className="text-paragraph-sm text-text-sub-600">
							You need a domain to send emails from your own domain
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() =>
							window.open("https://reloop.sh/docs/domain", "_blank")
						}
					>
						<Icon name="file-text" className="h-4 w-4" />
						Go to docs
					</Button.Root>
				</div>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-red-800">
						Failed to load DNS records. Please try again.
					</p>
				</div>
			</div>
		);
	}

	if (
		!domainData ||
		!domainData.dnsRecords ||
		domainData.dnsRecords.length === 0
	) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
					<div>
						<h1 className="font-medium text-title-h5 leading-8">Add Domain</h1>
						<p className="text-paragraph-sm text-text-sub-600">
							You need a domain to send emails from your own domain
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() =>
							window.open("https://reloop.sh/docs/domain", "_blank")
						}
					>
						<Icon name="file-text" className="h-4 w-4" />
						Go to docs
					</Button.Root>
				</div>
				<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p className="text-yellow-800">
						No DNS records found for this domain. Please generate DNS records
						first.
					</p>
				</div>
			</div>
		);
	}

	// Separate DMARC records from DKIM/SPF records
	const dmarcRecords = domainData.dnsRecords.filter(
		(record) =>
			record.name.includes("_dmarc") ||
			(record.recordType === "TXT" && record.value.includes("v=DMARC")),
	);
	const otherRecords = domainData.dnsRecords.filter(
		(record) =>
			!record.name.includes("_dmarc") &&
			!(record.recordType === "TXT" && record.value.includes("v=DMARC")),
	);

	const renderRecordTable = (records: DNSRecord[], startIndex: number) => (
		<div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
			{/* Header */}
			<div className="grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3">
				<div className="font-medium text-sm text-text-sub-600">Type</div>
				<div className="font-medium text-sm text-text-sub-600">Record name</div>
				<div className="font-medium text-sm text-text-sub-600">Value</div>
				<div className="font-medium text-sm text-text-sub-600">TTL</div>
				<div className="font-medium text-sm text-text-sub-600">Status</div>
			</div>

			{/* Body */}
			<div className="bg-white">
				{records.map((record, idx) => {
					const index = startIndex + idx;
					return (
						<React.Fragment key={index}>
							<div className="group grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 px-4 py-3 hover:bg-bg-weak-50">
								{/* Type */}
								<div className="flex items-center">
									<span className="font-medium text-sm text-text-strong-950">
										{record.recordType}
									</span>
								</div>

								{/* Record name */}
								<div className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										onClick={() =>
											copyToClipboard(record.name, `host-${index}`)
										}
										className={`cursor-pointer truncate text-left text-sm transition-colors ${
											copiedItems.has(`host-${index}`)
												? "text-green-600"
												: "text-text-strong-950 hover:text-text-strong-950/80"
										}`}
										title="Click to copy record name"
									>
										<code className="text-sm">
											{copiedItems.has(`host-${index}`)
												? "Copied"
												: record.name}
										</code>
									</button>
									<button
										type="button"
										onClick={() =>
											copyToClipboard(record.name, `host-${index}`)
										}
										className="flex-shrink-0 transition-opacity"
										title="Copy record name"
									>
										<Icon
											name={copiedItems.has(`host-${index}`) ? "check" : "copy"}
											className={`h-3.5 w-3.5 transition-colors ${
												copiedItems.has(`host-${index}`)
													? "text-green-600"
													: "text-text-sub-600 hover:text-text-strong-950"
											}`}
										/>
									</button>
								</div>

								{/* Value */}
								<div className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										onClick={() =>
											copyToClipboard(record.value, `value-${index}`)
										}
										className="flex-1 cursor-pointer truncate text-left text-sm text-text-strong-950"
									>
										{record.value}
									</button>
									<button
										type="button"
										onClick={() =>
											copyToClipboard(record.value, `value-${index}`)
										}
										className="flex-shrink-0 cursor-pointer transition-opacity"
										title="Copy value"
									>
										<Icon
											name={
												copiedItems.has(`value-${index}`) ? "check" : "copy"
											}
											className={`h-3.5 w-3.5 transition-colors ${
												copiedItems.has(`value-${index}`)
													? "text-green-600"
													: "text-text-sub-600 hover:text-text-strong-950"
											}`}
										/>
									</button>
								</div>

								{/* TTL */}
								<div className="flex items-center">
									<span className="text-sm text-text-strong-950">
										{record.ttl}
									</span>
								</div>

								{/* Status */}
								<div className="flex items-center gap-2">
									<div
										className={`h-2 w-2 rounded-full ${
											record.isVerified ? "bg-green-500" : "bg-orange-500"
										}`}
									/>
									<span
										className={`text-sm ${
											record.isVerified ? "text-green-600" : "text-orange-600"
										}`}
									>
										{record.isVerified ? "Verified" : "Pending"}
									</span>
								</div>
							</div>
							{idx < records.length - 1 && (
								<div className="border-stroke-soft-200 border-b" />
							)}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8">
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">Domain Added</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						You have successfully added the domain
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button.Root
						onClick={() => {
							push("/domain");
						}}
						size="xsmall"
						variant="neutral"
					>
						I have add the DNS records
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() =>
							window.open("https://reloop.sh/docs/domain", "_blank")
						}
					>
						<Icon name="file-text" className="h-4 w-4" />
					</Button.Root>
				</div>
			</div>

			<div className="relative my-10">
				<div className="relative flex flex-col">
					<div className="rounded-2xl border border-success-light bg-success-base/5 p-4">
						<div className="flex items-center gap-2">
							<p className="font-medium text-title-h6">Domain</p>
							<Icon
								name="checkbox-circle"
								className="mt-1 h-3.5 w-3.5 text-success-base"
							/>
						</div>
						<p className="w-60 text-sm text-text-sub-600">New added domain</p>
						<p className="mt-3 w-96 rounded-lg border border-success-light px-3 py-1.5">
							{domainId}
						</p>
					</div>
				</div>

				{/* DKIM and SPF Records */}
				{otherRecords.length > 0 && (
					<div className="relative mt-10">
						<div className="mb-6 space-y-1">
							<div className="font-medium text-base text-text-strong-950">
								DKIM and SPF{" "}
								<span className="text-text-sub-600">(Required)</span>
							</div>
							<div className="text-sm text-text-sub-600">
								Enable email signing and specify authorized senders.
							</div>
						</div>
						<div className="w-full">{renderRecordTable(otherRecords, 0)}</div>
					</div>
				)}

				{/* DMARC Records */}
				{dmarcRecords.length > 0 && (
					<div className="relative mt-10">
						<div className="mb-6 space-y-1">
							<div className="font-medium text-base text-text-strong-950">
								DMARC <span className="text-text-sub-600">(Recommended)</span>
							</div>
							<div className="text-sm text-text-sub-600">
								Set authentication policies and receive reports.
							</div>
						</div>
						<div className="w-full">
							{renderRecordTable(dmarcRecords, otherRecords.length)}
						</div>
					</div>
				)}

				<div className="relative mt-10">
					<Button.Root
						onClick={() => {
							push("/domain");
						}}
						className="mt-10"
						size="xsmall"
						variant="neutral"
					>
						I have add the DNS records
					</Button.Root>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
