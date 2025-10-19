"use client";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import * as Table from "@reloop/ui/table";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { Globe } from "../globe";

interface DNSRecord {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	description?: string;
	isVerified: boolean;
}

const DomainPage = () => {
	const { domainId } = useParams();
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

	const {
		data: dnsRecords,
		error,
		isLoading,
	} = useSWR<DNSRecord[]>(domainId ? `/api/domain/v1/dns/${domainId}` : null, {
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
			<div className="mx-auto max-w-3xl">
				<div className="my-10 flex items-center gap-3">
					<Globe className="rounded-full" iconClassName="h-8 w-8" />
					<div>
						<p className="text-paragraph-sm text-text-sub-600">Domain</p>
						<h1 className="font-medium text-title-h4 leading-8">{domainId}</h1>
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
			<div className="mx-auto max-w-3xl">
				<div className="my-10 flex items-center gap-3">
					<Globe className="rounded-full" iconClassName="h-8 w-8" />
					<div>
						<p className="text-paragraph-sm text-text-sub-600">Domain</p>
						<h1 className="font-medium text-title-h4 leading-8">{domainId}</h1>
					</div>
				</div>
				<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p className="text-yellow-800">
						No DNS records found for this domain.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl">
			<div className="my-10 flex items-center gap-3">
				<Globe className="rounded-full" iconClassName="h-8 w-8" />
				<div>
					<p className="text-paragraph-sm text-text-sub-600">Domain</p>
					<h1 className="font-medium text-title-h4 leading-8">{domainId}</h1>
				</div>
			</div>
			<div className="relative mb-10 rounded-2xl border border-stroke-soft-200 p-10">
				<p className="font-medium text-title-h5">DNS Records</p>
				<div className="mt-5 space-y-1 py-4">
					<div className="font-medium text-text-strong-950 leading-4">
						DKIM, SPF, and DMARC
					</div>
					<div className="text-paragraph-sm text-text-sub-600">
						Add the DNS records to your domain to start sending emails.
					</div>
				</div>
				<div className="w-full">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head className="w-20 font-medium text-sm">
									Type
								</Table.Head>
								<Table.Head className="w-48 font-medium text-sm">
									Host / Name
								</Table.Head>
								<Table.Head className="max-w-0 font-medium text-sm">
									Value
								</Table.Head>
								<Table.Head className="w-20 font-medium text-sm">
									Priority
								</Table.Head>
								<Table.Head className="w-20 font-medium text-sm">
									TTL
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{dnsRecords.map((record, index) => (
								<React.Fragment key={index}>
									<Table.Row>
										<Table.Cell className="h-10">
											<span className="inline-flex items-center py-0.5 font-medium text-sm">
												{record.recordType}
											</span>
										</Table.Cell>
										<Table.Cell className="h-10">
											<div className="flex items-center gap-2">
												<code className="text-label-sm text-text-strong-950">
													{record.name}
												</code>
												<button
													type="button"
													onClick={() =>
														copyToClipboard(record.name, `host-${index}`)
													}
													className="opacity-0 transition-opacity group-hover/row:opacity-100"
													title="Copy host name"
												>
													<motion.div
														animate={
															copiedItems.has(`host-${index}`)
																? "copied"
																: "default"
														}
														transition={{ duration: 0.2, ease: "easeInOut" }}
													>
														<Icon
															name={
																copiedItems.has(`host-${index}`)
																	? "check"
																	: "copy"
															}
															className={`h-3 w-3 transition-colors ${
																copiedItems.has(`host-${index}`)
																	? "text-green-600"
																	: "text-text-sub-600 hover:text-text-strong-950"
															}`}
														/>
													</motion.div>
												</button>
											</div>
										</Table.Cell>
										<Table.Cell className="h-10 max-w-0">
											<div className="flex min-w-0 items-center gap-2">
												<button
													type="button"
													onClick={() =>
														copyToClipboard(record.value, `value-${index}`)
													}
													className="flex-1 cursor-pointer truncate text-left text-label-sm text-text-strong-950"
												>
													{record.value}
												</button>
												<button
													type="button"
													onClick={() =>
														copyToClipboard(record.value, `value-${index}`)
													}
													className="flex-shrink-0 cursor-pointer opacity-0 transition-opacity group-hover/row:opacity-100"
													title="Copy value"
												>
													<motion.div
														animate={
															copiedItems.has(`value-${index}`)
																? "copied"
																: "default"
														}
														variants={{
															default: { scale: 1 },
															copied: { scale: 1.1 },
														}}
														transition={{ duration: 0.2, ease: "easeInOut" }}
													>
														<Icon
															name={
																copiedItems.has(`value-${index}`)
																	? "check"
																	: "copy"
															}
															className={`h-3 w-3 transition-colors ${
																copiedItems.has(`value-${index}`)
																	? "text-green-600"
																	: "text-text-sub-600 hover:text-text-strong-950"
															}`}
														/>
													</motion.div>
												</button>
											</div>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{record.priority || ""}
											</span>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{record.ttl}
											</span>
										</Table.Cell>
									</Table.Row>
									{index < dnsRecords.length - 1 && <Table.RowDivider />}
								</React.Fragment>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		</div>
	);
};

export default DomainPage;
