import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { DnsTableMinimal } from "./dns-table-minimal";
import type { DNSRecord } from "./domain-types";

export function DnsRecordSection({
	title,
	statusText,
	records,
	onCopyToClipboard,
	isLoading,
	docsUrl,
	loadingRows = 1,
	className,
}: {
	title: string;
	statusText?: string;
	records: DNSRecord[];
	onCopyToClipboard: (text: string) => void;
	isLoading: boolean;
	docsUrl?: string;
	loadingRows?: number;
	className?: string;
}) {
	return (
		<div className={cn("relative", className)}>
			<div className="mb-3 flex items-start justify-between gap-4">
				<a
					href={docsUrl || "#"}
					target={docsUrl?.startsWith("http") ? "_blank" : undefined}
					rel={docsUrl?.startsWith("http") ? "noreferrer" : undefined}
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
				<DnsTableMinimal
					records={records}
					onCopyToClipboard={onCopyToClipboard}
					isLoading={isLoading}
					loadingRows={loadingRows}
				/>
			</div>
		</div>
	);
}
