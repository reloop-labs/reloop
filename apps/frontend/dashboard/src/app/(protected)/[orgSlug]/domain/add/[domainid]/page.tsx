"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import * as React from "react";
import { useUserOrganization } from "src/providers/org-provider";
import useSWR from "swr";
import { Globe } from "../../globe";

interface DNSRecord {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	description?: string;
	isVerified: boolean;
}

const NewDomainPage = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const { push } = useUserOrganization();
	const { domainid } = useParams();

	const {
		data: dnsRecords,
		error,
		isLoading,
	} = useSWR<DNSRecord[]>(domainid ? `/api/domain/v1/dns/${domainid}` : null, {
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
			<div className="mx-auto mb-28 flex h-96 max-w-3xl items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto mb-28 max-w-3xl">
				<div className="my-10 flex items-center gap-3">
					<Globe className="rounded-full" iconClassName="h-8 w-8" />
					<div>
						<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
						<p className="text-paragraph-sm text-text-sub-600">
							Add a new domain and start sending emails from your domain
						</p>
					</div>
				</div>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-red-800">
						Failed to load DNS records. Please try again.
					</p>
				</div>
			</div>
		);
	}

	if (!dnsRecords || dnsRecords.length === 0) {
		return (
			<div className="mx-auto mb-28 max-w-3xl">
				<div className="my-10 flex items-center gap-3">
					<Globe className="rounded-full" iconClassName="h-8 w-8" />
					<div>
						<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
						<p className="text-paragraph-sm text-text-sub-600">
							Add a new domain and start sending emails from your domain
						</p>
					</div>
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
	const dmarcRecords = dnsRecords.filter(
		(record) =>
			record.name.includes("_dmarc") ||
			(record.recordType === "TXT" && record.value.includes("v=DMARC")),
	);
	const otherRecords = dnsRecords.filter(
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
		<div className="mx-auto mb-28 max-w-3xl">
			<div className="my-10 flex items-center gap-3">
				<Globe className="rounded-full" iconClassName="h-8 w-8" />
				<div>
					<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Add a new domain and start sending emails from your domain
					</p>
				</div>
			</div>
			<div className="relative my-10 ml-8 border-stroke-soft-200 border-l pt-10 pb-20">
				<div className="relative flex flex-col pl-10">
					<div className="-left-3.5 absolute top-4 rounded-full bg-bg-white-0 p-2">
						<div className="h-3 w-3 rounded-full border-2 border-success-base bg-bg-white-0" />
					</div>
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
							{domainid}
						</p>
					</div>
				</div>

				{/* DKIM and SPF Records */}
				{otherRecords.length > 0 && (
					<div className="relative mt-10 pl-10">
						<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
							<div className="h-3 w-3 rounded-full border-2 bg-bg-white-0" />
						</div>
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
					<div className="relative mt-10 pl-10">
						<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
							<div className="h-3 w-3 rounded-full border-2 bg-bg-white-0" />
						</div>
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

				<div className="relative mt-10 pl-10">
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
