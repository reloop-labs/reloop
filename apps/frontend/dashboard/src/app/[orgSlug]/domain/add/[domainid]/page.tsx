"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Table from "@reloop/ui/components/table";
import { motion } from "motion/react";
import * as React from "react";
import { Globe } from "../../globe";

const dnsRecords = [
	{
		type: "MX",
		host: "send.test",
		value: "feedback-smtp.ap-northelfajs;lajf ;lj sdjlds",
		priority: "10",
		ttl: "Auto",
	},
	{
		type: "TXT",
		host: "send.test",
		value: "v=spf1 include:amazonss;elfjasd; jds;jds;lka j",
		priority: "",
		ttl: "Auto",
	},
	{
		type: "TXT",
		host: "test._domainkey.test",
		value: "p=MIGfMA0GCSqGSIb3DQEBs;elfjasd; jds;jds;lka j",
		priority: "",
		ttl: "Auto",
	},
	{
		type: "TXT",
		host: "_dmarc",
		value: "v=DMARC1; p=none",
		priority: "",
		ttl: "Auto",
	},
];

const NewDomainPage = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const { push } = useUserOrganization();
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

	return (
		<div className="mx-auto mb-28 max-w-3xl">
			<div className="my-10 flex items-center gap-3">
				<Globe />
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
							dkim.example.com
						</p>
					</div>
				</div>
				<div className="relative mt-10 pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className=" h-3 w-3 rounded-full border-2 bg-bg-white-0" />
					</div>
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
													{record.type}
												</span>
											</Table.Cell>
											<Table.Cell className="h-10">
												<div className="flex items-center gap-2">
													<code className="text-label-sm text-text-strong-950">
														{record.host}
													</code>
													<button
														type="button"
														onClick={() =>
															copyToClipboard(record.host, `host-${index}`)
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
													{record.priority}
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
