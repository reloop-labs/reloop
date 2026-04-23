"use client";

import type { DNSRecord } from "@reloop/api/types";
import * as Switch from "@reloop/ui/switch";
import type * as React from "react";
import { DNSRecordTableMinimal } from "./DNSRecordTableMinimal";

interface DNSRecordSectionProps {
	title: string;
	statusText?: string;
	description?: string;
	records: DNSRecord[];
	onCopyToClipboard: (text: string) => void;
	isLoading: boolean;
	tableId: string;
	switchProps?: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		disabled: boolean;
	};
}

export const DNSRecordSection: React.FC<DNSRecordSectionProps> = ({
	title,
	statusText,
	description,
	records,
	onCopyToClipboard,
	isLoading,
	tableId,
}) => {
	return (
		<div className="relative mt-10">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="space-y-1">
					<div className="font-medium text-sm text-text-strong-950">
						{title}{" "}
						{statusText && (
							<span className="text-text-sub-600 text-xs">({statusText})</span>
						)}
					</div>
					{description && (
						<div className="text-text-sub-600 text-xs">{description}</div>
					)}
				</div>
			</div>
			<div className="w-full">
				<DNSRecordTableMinimal
					records={records}
					onCopyToClipboard={onCopyToClipboard}
					isLoading={isLoading}
					loadingRows={1}
					tableId={tableId}
				/>
			</div>
		</div>
	);
};
