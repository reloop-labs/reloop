import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

export function ConfigureDnsActions({
	isVerifying,
	onSkip,
	onVerify,
}: {
	isVerifying: boolean;
	onSkip: () => void;
	onVerify: () => void;
}) {
	return (
		<div className="mt-8 flex items-center justify-end gap-3">
			<Button.Root
				variant="neutral"
				mode="ghost"
				size="small"
				onClick={onSkip}
				className="gap-1.5 rounded-xl"
			>
				Skip
			</Button.Root>
			<FancyButton.Root
				onClick={onVerify}
				size="small"
				variant="blue"
				className="min-w-[165px] justify-center overflow-hidden whitespace-nowrap rounded-xl"
				disabled={isVerifying}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.span
						key={isVerifying ? "verifying" : "idle"}
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
						{isVerifying ? (
							<>
								<Spinner size={14} color="currentColor" />
								<span>Verifying...</span>
							</>
						) : (
							<span>Verify DNS Records</span>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</div>
	);
}
