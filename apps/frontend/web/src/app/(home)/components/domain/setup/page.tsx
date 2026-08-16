"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import type { Ref } from "react";
import { ActionKbd, actionKbdOnBlueClassName } from "../_shared/action-kbd";
import { CloudflareBanner } from "../_shared/cloudflare-banner";
import type { DemoDomain } from "../_shared/data";
import { DnsRecordTable } from "../_shared/dns-record-table";
import { MotionItem, MotionStage } from "../_shared/page-motion";

function RecordGroup({
	title,
	icon,
	records,
	hideStatus = true,
	showPriority = false,
}: {
	title: string;
	icon: string;
	records: DemoDomain["dnsRecords"];
	hideStatus?: boolean;
	showPriority?: boolean;
}) {
	if (records.length === 0) return null;
	return (
		<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
			<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
				<Icon name={icon} className="h-4 w-4 text-text-sub-600" />
				<h3 className="font-semibold">{title}</h3>
			</div>
			<DnsRecordTable
				records={records}
				hideStatus={hideStatus}
				showPriorityColumn={showPriority}
				flow
			/>
		</div>
	);
}

export function DomainSetupPage({
	domain,
	cloudflareRef,
	cloudflarePressed,
	connecting,
}: {
	domain: DemoDomain;
	cloudflareRef?: Ref<HTMLDivElement>;
	cloudflarePressed?: boolean;
	connecting?: boolean;
}) {
	const dkimRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "DKIM",
	);
	const sendingRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "SPF",
	);
	const dmarcRecords = domain.dnsRecords.filter(
		(record) => record.recordTypeName === "DMARC",
	);
	const receivingRecords = domain.dnsRecords.filter(
		(record) => record.purpose === "receiving",
	);

	return (
		<MotionStage
			className="mx-auto max-w-3xl space-y-6 overflow-hidden p-6 lg:p-8"
			staggerChildren={0.12}
			delayChildren={0.06}
			orchestrate
		>
			<MotionItem className="pt-6">
				<h1 className="font-semibold text-title-h6 leading-8">
					Configure DNS for {domain.domain}
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Add these records at your DNS provider, then verify.
				</p>
			</MotionItem>

			<MotionItem>
				<CloudflareBanner
					boxRef={cloudflareRef}
					pressed={cloudflarePressed}
					connecting={connecting}
				/>
			</MotionItem>

			<MotionItem>
				<RecordGroup
					title="Domain Verification"
					icon="shield"
					records={dkimRecords}
				/>
			</MotionItem>
			<MotionItem>
				<RecordGroup
					title="Email Sending"
					icon="mail-send"
					records={[...sendingRecords, ...dmarcRecords]}
				/>
			</MotionItem>
			<MotionItem>
				<RecordGroup
					title="Email Receiving"
					icon="mail-receive"
					records={receivingRecords}
					showPriority
				/>
			</MotionItem>

			<MotionItem className="flex items-center justify-between gap-3 pt-6">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					tabIndex={-1}
					className="gap-1.5 rounded-xl"
				>
					Close
					<span className="inline-flex items-center gap-0.5">
						<ActionKbd className="w-auto min-w-0 px-1">⌘</ActionKbd>
						<ActionKbd className="w-auto min-w-4 px-1">⌫</ActionKbd>
					</span>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					tabIndex={-1}
					className={cn(
						"min-w-[134px] justify-center overflow-hidden rounded-xl",
					)}
				>
					<span>Verify & finish</span>
					<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
				</FancyButton.Root>
			</MotionItem>
		</MotionStage>
	);
}
