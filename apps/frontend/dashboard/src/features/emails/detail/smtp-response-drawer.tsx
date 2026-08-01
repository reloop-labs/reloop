"use client";

import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export type SmtpDetailRow = {
	id: string;
	type: string;
	/** Kumo / display label e.g. Reception, Delivery */
	kumoType: string;
	recipient?: string;
	code?: number | null;
	content?: string | null;
	classification?: string | null;
	createdAt: string;
};

function detailCopy(row: SmtpDetailRow): {
	title: string;
	description: string;
} {
	const key = (row.kumoType || row.type).toLowerCase();
	const code = row.code ?? 0;
	const isSuccess = code > 0 && code < 400;
	const isTempFail = code >= 400 && code < 500;
	const isHardFail = code >= 500;

	if (key === "delivery" || key === "delivered") {
		return {
			title: "Delivered details",
			description: isSuccess
				? "The recipient's mail server accepted the email and returned a successful response. This confirms that the message was delivered successfully."
				: isTempFail
					? "The recipient's mail server temporarily rejected the message. Delivery may be retried automatically."
					: "The recipient's mail server rejected the message during the delivery attempt.",
		};
	}

	if (key === "reception" || key === "sent") {
		return {
			title: "Reception details",
			description:
				"The sending server accepted the message for processing and returned this SMTP response.",
		};
	}

	if (
		key === "bounce" ||
		key === "bounced" ||
		key === "failed" ||
		key === "deferred" ||
		key === "complaint"
	) {
		return {
			title: "Failure details",
			description: isHardFail
				? "The receiving server permanently rejected this message. It will not be delivered."
				: "The receiving server reported a problem with this message during delivery.",
		};
	}

	return {
		title: "SMTP response",
		description: "Reply from the receiving server during a delivery attempt.",
	};
}

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(`${label || "Value"} copied`);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3.5 w-3.5", copied && "text-success-base")}
			/>
		</button>
	);
}

export function SmtpResponseDrawer({
	row,
	open,
	onOpenChange,
}: {
	row: SmtpDetailRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const copy = row ? detailCopy(row) : null;
	const code = row?.code;
	const content = row?.content?.trim() || "";

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-[440px]">
				<Drawer.Header className="border-stroke-soft-100 border-b dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
						<Drawer.Title className="font-semibold text-[22px] tracking-tight">
							{copy?.title ?? "SMTP response"}
						</Drawer.Title>
					</div>
				</Drawer.Header>

				<Drawer.Body className="space-y-6 overflow-y-auto p-5">
					{row && copy ? (
						<>
							<p className="text-[14px] text-text-sub-600 leading-relaxed">
								{copy.description}
							</p>

							{(row.recipient || row.classification || code != null) && (
								<div className="space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 px-3.5 py-3 dark:border-stroke-soft-100/40">
									{row.recipient ? (
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-wide">
													Recipient
												</p>
												<p className="mt-0.5 truncate font-mono text-[13px] text-text-strong-950">
													{row.recipient}
												</p>
											</div>
										</div>
									) : null}
									{code != null ? (
										<div>
											<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-wide">
												Status code
											</p>
											<p
												className={cn(
													"mt-0.5 font-mono font-semibold text-[14px]",
													code >= 500
														? "text-error-base"
														: code >= 400
															? "text-warning-base"
															: "text-success-base",
												)}
											>
												{code}
											</p>
										</div>
									) : null}
									{row.classification ? (
										<div>
											<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-wide">
												Classification
											</p>
											<p className="mt-0.5 text-[13px] text-text-strong-950">
												{row.classification}
											</p>
										</div>
									) : null}
									{row.createdAt ? (
										<div>
											<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-wide">
												Time
											</p>
											<p className="mt-0.5 text-[13px] text-text-strong-950 tabular-nums">
												{new Date(row.createdAt).toLocaleString(undefined, {
													month: "short",
													day: "numeric",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
													second: "2-digit",
												})}
											</p>
										</div>
									) : null}
								</div>
							)}

							<div>
								<p className="mb-2 font-semibold text-[11px] text-text-soft-400 uppercase tracking-wide">
									SMTP response
								</p>
								<div className="relative overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
									{content ? (
										<>
											<div className="absolute top-2.5 right-2.5 z-10">
												<CopyButton value={content} label="SMTP response" />
											</div>
											<pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words p-3.5 pr-10 font-mono text-[12px] text-text-strong-950 leading-relaxed">
												{content}
											</pre>
										</>
									) : (
										<p className="p-3.5 text-[13px] text-text-sub-600">
											No SMTP response body was recorded for this event.
										</p>
									)}
								</div>
							</div>
						</>
					) : null}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
