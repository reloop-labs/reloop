import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { ModalHeader } from "../modal-header";

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
		<div className="flex flex-col">
			<ModalHeader
				title="API key rotated"
				icon="check-circle"
				iconClassName="text-success-base"
				onClose={() => {}}
				showCloseIcon={false}
			/>

			<Modal.Body className="space-y-4 px-5 py-3.5">
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<div className="flex items-center gap-4 border-stroke-soft-100 border-b px-4 dark:border-stroke-soft-100/40">
						{(["key", "env"] as const).map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={cn(
									"relative cursor-pointer py-2 font-medium text-xs transition-colors",
									activeTab === tab
										? "font-semibold text-text-strong-950"
										: "text-text-soft-400 hover:text-text-sub-600",
								)}
							>
								{tab === "key" ? "API Key" : ".env"}
								{activeTab === tab && (
									<span className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950" />
								)}
							</button>
						))}
					</div>
					<div className="p-2">
						<CopyCodeBlock
							key={activeTab}
							code={display}
							lang="bash"
							copyValue={display}
							label={activeTab === "env" ? ".env" : "secret"}
							hideLineNumbers
							noScroll
							codeExtraPadding
						/>
					</div>
				</div>

				<p className="flex items-start gap-1.5 text-error-base text-xs">
					<Icon
						name="alert-triangle"
						className="mt-px h-3.5 w-3.5 shrink-0"
					/>
					<span>
						The old key is invalid now. Copy the new secret — it won&apos;t be
						shown again.
					</span>
				</p>
			</Modal.Body>

			<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={onDone}
					className="gap-2"
				>
					Done
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<Icon
							name="enter"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
					</span>
				</Button.Root>
			</div>
		</div>
	);
}
