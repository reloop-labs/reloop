import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { CopyCodeBlock } from "./copy-code-block";
import { DeveloperPlayground } from "./developer-playground";
import type { IntegrationChoice } from "./types";

export function PostGenerate({
	apiKey,
	choice,
	onChoiceChange,
	onDone,
	finishing = false,
}: {
	apiKey: string;
	choice: IntegrationChoice;
	onChoiceChange: (choice: IntegrationChoice) => void;
	onDone: () => void;
	/** True while preparing session/orgs and navigating to the dashboard. */
	finishing?: boolean;
}) {
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!finishing) onDone();
		},
		{ enableOnFormTags: true },
		[onDone, finishing],
	);

	return (
		<div className="w-full min-w-0 max-w-2xl space-y-7">
			{/* Header */}
			<div className="space-y-2">
				<div>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						API Key
					</h1>
					<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
						Your API key — copy it now, you won&apos;t see it again.
					</p>
				</div>

				{/* Secret Key Display Box */}
				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
					minHeight="auto"
				/>
			</div>

			<DeveloperPlayground
				apiKey={apiKey}
				choice={choice}
				onChoiceChange={onChoiceChange}
			/>

			<div className="flex items-center justify-end gap-3 pb-4">
				<FancyButton.Root
					variant="blue"
					size="small"
					className={cn(
						"min-w-[170px] justify-center overflow-hidden rounded-xl whitespace-nowrap transition-all duration-200",
						finishing && "pointer-events-none opacity-90",
					)}
					onClick={onDone}
					disabled={finishing}
					aria-busy={finishing}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={finishing ? "finishing" : "done"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{
								opacity: 0,
								y: -14,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 14,
							}}
							className="flex items-center justify-center gap-1.5"
						>
							{finishing ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Opening dashboard...</span>
								</>
							) : (
								<>
									<Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" />
									<span>Go to Dashboard</span>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
