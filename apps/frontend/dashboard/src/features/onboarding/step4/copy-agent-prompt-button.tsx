import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

function PromptIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
			<path
				fill="currentColor"
				d="M6.75 14a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m-7.5-3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M8.25.5C9.22.5 10 1.28 10 2.25V3H8.5v-.75A.25.25 0 0 0 8.25 2h-5.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25H4.5v1.5H2.75C1.78 11.5 1 10.72 1 9.75v-7.5C1 1.28 1.78.5 2.75.5zm-1.5 7.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M6.75 4.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"
			/>
		</svg>
	);
}

/** Same control as the marketing hero — copies the onboarding agent prompt. */
export function CopyAgentPromptButton({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<FancyButton.Root
			type="button"
			variant="basic"
			size="small"
			onClick={handleCopy}
			className={cn("rounded-xl font-medium", className)}
			aria-label={copied ? "Copied" : "Copy agent prompt"}
		>
			<span className="relative inline-flex items-center justify-center">
				<span
					aria-hidden="true"
					className="pointer-events-none invisible flex items-center justify-center gap-2"
				>
					<PromptIcon className="size-4 shrink-0" />
					<span>Copy agent prompt</span>
				</span>
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={copied ? "copied" : "idle"}
						transition={{ type: "spring", duration: 0.22, bounce: 0 }}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap"
					>
						{copied ? (
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
							/>
						) : (
							<PromptIcon className="size-4 shrink-0" />
						)}
						<span>{copied ? "Copied!" : "Copy agent prompt"}</span>
					</motion.span>
				</AnimatePresence>
			</span>
		</FancyButton.Root>
	);
}
