import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmStep({
	displayName,
	keyPrefix,
	isRotating,
	onClose,
	onRotate,
}: {
	displayName: string;
	keyPrefix: string;
	isRotating: boolean;
	onClose: () => void;
	onRotate: () => void;
}) {
	return (
		<div>
			{/* Header */}
			<div className="pr-6">
				<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Rotate API key
				</Modal.Title>
				<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
					Refresh the API key to invalidate the current token and generate a new
					one. This will require updating all replica instances with the new token.
				</p>
			</div>

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
				All existing replicas will need to be updated with the new token.
				Replicas using the old token will lose connectivity.
			</div>

			{/* Footer Actions */}
			<div className="mt-6 flex items-center justify-end gap-3">
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="small"
					onClick={() => {
						if (!isRotating) onClose();
					}}
					className={cn(
						"transition-opacity duration-200",
						isRotating && "pointer-events-none opacity-50",
					)}
				>
					Cancel
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={() => {
						if (!isRotating) onRotate();
					}}
					className={cn(
						"min-w-[124px] justify-center overflow-hidden transition-all duration-200",
						isRotating && "pointer-events-none opacity-90",
					)}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isRotating ? "rotating" : "idle"}
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
							{isRotating ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Rotating...</span>
								</>
							) : (
								"Rotate key"
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
