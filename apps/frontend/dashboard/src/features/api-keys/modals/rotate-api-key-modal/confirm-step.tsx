import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function ConfirmStep({
	displayName,
	keyPrefix,
	confirmationText,
	onConfirmationTextChange,
	isRotating,
	inputRef,
}: {
	displayName: string;
	keyPrefix: string;
	confirmationText: string;
	onConfirmationTextChange: (val: string) => void;
	isRotating: boolean;
	inputRef: React.RefObject<HTMLInputElement | null>;
}) {
	const [nameCopied, setNameCopied] = useState(false);

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// silently fail
		}
	};

	return (
		<div>
			{/* Key Details Card */}
			<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
				<div>
					<p className="font-normal text-text-sub-600 text-xs">
						API key name
					</p>
					<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
						{displayName}
					</p>
				</div>
				<div>
					<p className="font-normal text-text-sub-600 text-xs">
						API key prefix
					</p>
					<div className="mt-1 flex items-center">
						<span className="font-medium font-mono text-sm">
							{keyPrefix}
						</span>
					</div>
				</div>
			</div>

			{/* Warning Banner */}
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Warning:</span> Services using this key will experience downtime until they are updated with the new secret.
			</div>

			{/* Confirmation Input */}
			<div className="mt-4 space-y-2">
				<Label.Root
					htmlFor="rotate-api-key-confirmation"
					className="flex flex-wrap items-center gap-1.5"
				>
					<span>Type</span>
					<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
						{displayName}
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								void handleCopyName();
							}}
							className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
							aria-label={`Copy ${displayName}`}
							title="Copy name"
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={nameCopied ? "check" : "copy"}
									initial={{ opacity: 0, scale: 0.6 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.6 }}
									transition={{ type: "spring", duration: 0.2, bounce: 0.3 }}
									className="flex items-center justify-center"
								>
									<Icon
										name={nameCopied ? "check" : "copy"}
										className={cn(
											"h-3 w-3",
											nameCopied ? "text-green-500" : "text-text-sub-600",
										)}
									/>
								</motion.span>
							</AnimatePresence>
						</button>
					</span>
					<span>to confirm</span>
				</Label.Root>
				<Input.Root size="medium">
					<Input.Wrapper>
						<Input.Input
							ref={inputRef}
							id="rotate-api-key-confirmation"
							value={confirmationText}
							onChange={(e) => onConfirmationTextChange(e.target.value)}
							placeholder={displayName}
							disabled={isRotating}
							autoComplete="off"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
		</div>
	);
}

