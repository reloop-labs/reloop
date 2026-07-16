
import type { DNSRecord } from "#/features/domain/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type * as React from "react";
import { DNSRecordTable } from "./dns-record-table";

interface DNSRecordSectionProps {
	title: string;
	statusText?: string;
	records: DNSRecord[];
	isLoading: boolean;
	docsUrl?: string;
	switchProps?: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		disabled: boolean;
	};
	loadingRows?: number;
	tableId?: string;
	className?: string;
}

export const DNSRecordSection: React.FC<DNSRecordSectionProps> = ({
	title,
	statusText,
	records,
	isLoading,
	docsUrl,
	loadingRows = 1,
	tableId,
	className,
}) => {
	return (
		<div className={cn("relative", className)}>
			<div className="mb-3 flex items-start justify-between gap-4">
				<a
					href={docsUrl || "#"}
					target={docsUrl?.startsWith("http") ? "_blank" : undefined}
					rel={docsUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
					className="block space-y-1 hover:underline"
				>
					<div className="flex items-center gap-0.5 font-medium text-sm text-text-strong-950">
						{title}{" "}
						{statusText && (
							<span className="text-text-sub-600 text-xs">({statusText})</span>
						)}
						{docsUrl && (
							<Icon
								name="arrow-up-right"
								className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-600"
							/>
						)}
					</div>
				</a>
			</div>
			<div className="w-full">
				<DNSRecordTable
					records={records}
					isLoading={isLoading}
					loadingRows={loadingRows}
					tableId={tableId}
					hideStatus={true}
				/>
			</div>
		</div>
	);
};
