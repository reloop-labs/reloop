"use client";

import type { DNSRecord } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type * as React from "react";
import { DNSRecordTableMinimal } from "./DNSRecordTableMinimal";

interface DNSRecordSectionProps {
	title: string;
	statusText?: string;
	records: DNSRecord[];
	onCopyToClipboard: (text: string) => void;
	isLoading: boolean;
	docsUrl?: string;
	switchProps?: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		disabled: boolean;
	};
}

export const DNSRecordSection: React.FC<DNSRecordSectionProps> = ({
	title,
	statusText,
	records,
	onCopyToClipboard,
	isLoading,
	docsUrl,
}) => {
	return (
		<div className="relative mt-10">
			<div className="mb-3 flex items-start justify-between gap-4">
				<Link
					href={docsUrl || "#"}
					target={docsUrl?.startsWith("http") ? "_blank" : undefined}
					className="block space-y-1 hover:underline"
				>
					<div className="flex items-center gap-0.5 font-medium text-sm text-text-strong-950">
						{title}{" "}
						{statusText && (
							<span className="text-text-sub-600 text-xs">({statusText})</span>
						)}
						{docsUrl && (
							<Icon
								name="arrow-top-right"
								className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-600"
							/>
						)}
					</div>
				</Link>
			</div>
			<div className="w-full">
				<DNSRecordTableMinimal
					records={records}
					onCopyToClipboard={onCopyToClipboard}
					isLoading={isLoading}
					loadingRows={1}
				/>
			</div>
		</div>
	);
};
