import { cn } from "@reloop/ui/cn";
import { motion } from "framer-motion";
import { useState } from "react";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";

export function SuccessStep({ secret }: { secret: string }) {
	const [activeTab, setActiveTab] = useState<"key" | "env">("key");

	const display =
		activeTab === "env" ? `RELOOP_API_KEY=${secret}` : secret;

	return (
		<div>
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
								<motion.span
									layoutId="rotate-modal-active-tab"
									transition={{ type: "spring", stiffness: 400, damping: 30 }}
									className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950 dark:bg-white"
								/>
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
				<span className="font-semibold">Warning:</span> The old API key is
				invalid now. Make sure to copy your new secret key — it won&apos;t
				be shown again.
			</div>
		</div>
	);
}
