import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { ForwardDNSRecordsButton } from "#/features/domain/add/setup/components/forward-dns-records";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function ConfigureDnsActions({
	domainId,
	isVerifying,
	onSkip,
	onVerify,
}: {
	domainId?: string;
	isVerifying: boolean;
	onSkip: () => void;
	onVerify: () => void;
}) {
	return (
		<div className="mt-8 flex items-center justify-between gap-3">
			<Button.Root
				variant="neutral"
				mode="lighter"
				size="small"
				onClick={onSkip}
				disabled={isVerifying}
				className="gap-1.5 rounded-xl"
			>
				Skip
				<ActionKbd className="w-auto min-w-0 px-1">⌥S</ActionKbd>
			</Button.Root>
			<div className="flex items-center gap-3">
				{domainId ? <ForwardDNSRecordsButton domainId={domainId} /> : null}
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
								<>
									<span>Verify DNS Records</span>
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
