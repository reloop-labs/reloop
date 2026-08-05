import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function FormActions({
	isLoading,
	onSkip,
}: {
	isLoading: boolean;
	onSkip: () => void;
}) {
	return (
		<div className="mt-3 flex items-center gap-3">
			<Button.Root
				type="button"
				variant="neutral"
				mode="lighter"
				size="medium"
				className="h-10 shrink-0 gap-1.5 rounded-xl px-4"
				onClick={onSkip}
				disabled={isLoading}
			>
				Skip
				<ActionKbd className="w-auto min-w-0 px-1">⌥S</ActionKbd>
			</Button.Root>
			<FancyButton.Root
				type="submit"
				variant="blue"
				size="medium"
				className="h-10 w-full flex-1 justify-center overflow-hidden whitespace-nowrap rounded-xl"
				disabled={isLoading}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.span
						key={isLoading ? "loading" : "idle"}
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
						{isLoading ? (
							<>
								<Spinner size={14} color="currentColor" />
								<span>Adding Domain...</span>
							</>
						) : (
							<>
								<span>Add Domain</span>
								<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
							</>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</div>
	);
}
