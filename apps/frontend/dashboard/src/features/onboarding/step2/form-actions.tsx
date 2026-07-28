import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

export function FormActions({
	isLoading,
	onSkip,
}: {
	isLoading: boolean;
	onSkip: () => void;
}) {
	return (
		<div className="mt-3 flex w-full flex-col gap-3">
			<FancyButton.Root
				type="submit"
				variant="blue"
				size="medium"
				className="h-10 w-full justify-center overflow-hidden rounded-xl whitespace-nowrap font-medium text-sm"
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
							<span>Add Domain</span>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
			<Button.Root
				type="button"
				variant="neutral"
				mode="ghost"
				size="small"
				className="w-full justify-center rounded-xl text-text-soft-400 hover:text-text-strong-950"
				onClick={onSkip}
				disabled={isLoading}
			>
				Skip
			</Button.Root>
		</div>
	);
}
