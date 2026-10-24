import NumberFlow from "@number-flow/react";
import {
	creditPack,
	creditPackPriceCents,
	creditPackSizes,
	type PlanId,
} from "@reloop/pricing";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

import { useEffect, useState } from "react";
import { useCreditsCheckout } from "./use-billing-actions";

const DEFAULT_PACK = 10_000;

function packLabel(emails: number): string {
	return `${emails / 1000}k`;
}

function formatUsd(cents: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(cents / 100);
}

function addMonths(from: Date, months: number): Date {
	const d = new Date(from);
	d.setMonth(d.getMonth() + months);
	return d;
}

function formatDate(d: Date): string {
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

interface BuyCreditsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPlanId: PlanId;
	/** Expiry of credits the org already holds, if any. */
	currentExpiresAt?: string | null;
}

export function BuyCreditsModal({
	open,
	onOpenChange,
	currentPlanId,
	currentExpiresAt,
}: BuyCreditsModalProps) {
	const [emails, setEmails] = useState<number>(DEFAULT_PACK);
	const checkout = useCreditsCheckout();

	useEffect(() => {
		if (open) setEmails(DEFAULT_PACK);
	}, [open]);

	const priceCents = creditPackPriceCents(emails);
	// A new purchase extends every credit the org holds.
	const fresh = addMonths(new Date(), creditPack.validityMonths);
	const existing = currentExpiresAt ? new Date(currentExpiresAt) : null;
	const validUntil = existing && existing > fresh ? existing : fresh;
	const unlocksProLimits = currentPlanId === "free";

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-[560px]" showClose={false}>
				<div className="flex items-center justify-between px-5 py-4">
					<Modal.Title className="font-semibold text-text-strong-950 text-title-h6">
						Buy email credits
					</Modal.Title>
					<Modal.Close asChild>
						<button
							type="button"
							className="flex size-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Close"
						>
							<Icon name="plus" className="h-4 w-4 rotate-45" />
						</button>
					</Modal.Close>
				</div>

				<div className="space-y-5 px-5 pb-5">
					<p className="text-paragraph-sm text-text-sub-600">
						Pay once, no subscription. {formatUsd(creditPackPriceCents(1000))}{" "}
						per 1,000 emails, used after your monthly emails run out. Credits
						last {creditPack.validityMonths} months.
					</p>

					<fieldset
						aria-label="Credit pack"
						className="m-0 grid min-w-0 grid-cols-3 gap-2 border-0 p-0 sm:grid-cols-5"
					>
						{creditPackSizes.map((size) => {
							const selected = size === emails;
							return (
								<button
									key={size}
									type="button"
									aria-pressed={selected}
									onClick={() => setEmails(size)}
									className={cn(
										"flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-[border-color,box-shadow,background-color] duration-150",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950/20",
										selected
											? "border-transparent bg-bg-white-0 shadow-xs ring-[1.5px] ring-text-strong-950 dark:bg-white/[0.04] dark:ring-white"
											: "border-stroke-soft-100 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.04]",
									)}
								>
									<span className="font-medium text-label-sm text-text-strong-950 tabular-nums">
										{packLabel(size)}
									</span>
									<span className="text-[12px] text-text-sub-600 tabular-nums">
										{formatUsd(creditPackPriceCents(size))}
									</span>
								</button>
							);
						})}
					</fieldset>

					<div className="space-y-2.5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<div className="flex items-center justify-between text-paragraph-sm">
							<span className="text-text-sub-600">Emails</span>
							<span className="font-medium text-text-strong-950 tabular-nums">
								<NumberFlow value={emails} />
							</span>
						</div>
						<div className="flex items-center justify-between text-paragraph-sm">
							<span className="text-text-sub-600">Valid until</span>
							<span className="font-medium text-text-strong-950">
								{formatDate(validUntil)}
							</span>
						</div>
						{unlocksProLimits ? (
							<p className="flex items-start gap-2 border-stroke-soft-100 border-t pt-2.5 text-paragraph-xs text-text-sub-600 dark:border-stroke-soft-100/40">
								<Icon
									name="check-circle"
									className="mt-px h-3.5 w-3.5 shrink-0 text-text-sub-600"
								/>
								While your credits last you also get Pro limits: no daily cap, 5
								agent inboxes, 5 webhooks and 5 custom domains.
							</p>
						) : null}
					</div>
				</div>

				<Modal.Footer className="border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div>
						<p className="text-paragraph-xs text-text-sub-600">
							One-time payment
						</p>
						<p className="font-medium text-label-sm text-text-strong-950 tabular-nums">
							<NumberFlow
								value={priceCents / 100}
								format={{
									style: "currency",
									currency: "USD",
									minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
									maximumFractionDigits: 2,
								}}
							/>
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="small"
							className="font-medium"
							disabled={checkout.isPending}
							onClick={() => checkout.mutate(emails)}
						>
							{checkout.isPending ? "Redirecting…" : "Continue to checkout"}
						</FancyButton.Root>
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
