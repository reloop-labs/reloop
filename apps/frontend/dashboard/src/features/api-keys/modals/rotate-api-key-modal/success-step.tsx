import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";

export function SuccessStep({
	secret,
	onDone,
}: {
	secret: string;
	onDone: () => void;
}) {
	const [activeTab, setActiveTab] = useState<"key" | "env">("key");

	const display =
		activeTab === "env" ? `RELOOP_API_KEY=${secret}` : secret;

	return (
		<div>
			{/* Header */}
			<div className="pr-6">
				<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					API key rotated
				</Modal.Title>
				<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
					Your new API key has been generated. Save this secret key now — for
					security, you won&apos;t be able to see it again.
				</p>
			</div>

			{/* Key Display Card */}
			<div className="mt-5 space-y-2">
				<div className="flex items-center gap-4 px-1">
					{(["key", "env"] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={cn(
								"relative cursor-pointer py-1 font-medium text-xs transition-colors",
								activeTab === tab
									? "font-semibold text-text-strong-950 dark:text-white"
									: "text-text-soft-400 hover:text-text-sub-600 dark:text-white/60",
							)}
						>
							{tab === "key" ? "API Key" : ".env"}
							{activeTab === tab && (
								<span className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950 dark:bg-white" />
							)}
						</button>
					))}
				</div>

				<CopyCodeBlock
					key={activeTab}
					code={display}
					lang="bash"
					copyValue={display}
					label={activeTab === "env" ? ".env" : "secret key"}
					minHeight="auto"
				/>
			</div>

			{/* Warning Banner */}
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Warning:</span> The old API key is invalid
				now. Make sure to copy your new secret key — it won&apos;t be shown
				again.
			</div>

			{/* Footer Actions */}
			<div className="mt-6 flex items-center justify-end">
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={onDone}
					className="min-w-[100px] justify-center gap-2"
				>
					Done
					<span className="inline-flex items-center gap-0.5 opacity-80">
						<Icon
							name="command"
							className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
						/>
						<Icon
							name="enter"
							className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
						/>
					</span>
				</FancyButton.Root>
			</div>
		</div>
	);
}
