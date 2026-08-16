import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import type { Ref } from "react";
import { siCloudflare } from "simple-icons";
import { ActionKbd, actionKbdOnBlueClassName } from "./action-kbd";

export function CloudflareBanner({
	boxRef,
	pressed,
	connecting,
}: {
	boxRef?: Ref<HTMLDivElement>;
	pressed?: boolean;
	connecting?: boolean;
}) {
	return (
		<div
			ref={boxRef}
			className={cn(
				"overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40",
				pressed && "scale-[0.99]",
			)}
		>
			<div className="flex items-center justify-between gap-6">
				<div className="flex gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-white-0 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/50 dark:ring-stroke-soft-100/40">
						<div
							className="flex h-10 w-10 items-center justify-center rounded-lg"
							style={{ backgroundColor: `#${siCloudflare.hex}15` }}
						>
							<span
								className="flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
								style={{ fill: `#${siCloudflare.hex}` }}
								dangerouslySetInnerHTML={{ __html: siCloudflare.svg }}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<h3 className="font-semibold text-paragraph-base text-text-strong-950">
							Cloudflare
						</h3>
						<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
							We've detected your domain is managed by Cloudflare. We can
							automatically configure all required DNS records for you.
						</p>
						<span className="inline-flex items-center gap-1 text-paragraph-xs text-text-sub-600 underline decoration-stroke-soft-200 decoration-dashed underline-offset-4">
							Manual Cloudflare setup guide
						</span>
					</div>
				</div>

				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					tabIndex={-1}
					className="min-w-[170px] justify-center overflow-hidden rounded-xl px-4 transition-all duration-200"
				>
					{connecting ? (
						<span>Connecting...</span>
					) : (
						<>
							<span>Auto populate</span>
							<ActionKbd className={actionKbdOnBlueClassName}>A</ActionKbd>
						</>
					)}
				</FancyButton.Root>
			</div>
		</div>
	);
}
