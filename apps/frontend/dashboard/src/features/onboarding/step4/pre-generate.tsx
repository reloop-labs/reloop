import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnButtonClassName = actionKbdOnSolidClassName;

export function PreGenerate({
	loading,
	onGenerate,
	mustRegenerate = false,
}: {
	loading: boolean;
	onGenerate: () => void;
	mustRegenerate?: boolean;
}) {
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!loading) onGenerate();
		},
		{ enableOnFormTags: true, preventDefault: true },
		[loading, onGenerate],
	);

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center">
			<div className="mb-6 flex items-center justify-center">
				<Icon name="key-new" className="h-10 w-10 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{mustRegenerate ? "Generate a new API key" : "Create your API key"}
			</h3>
			<p className="mx-auto mb-6 max-w-lg text-balance font-medium text-[12px] text-text-sub-600">
				{mustRegenerate
					? "This page was reloaded, so the previous key is no longer shown. Generate a new one to continue."
					: "This key lets your app send emails through Reloop. Copy it now. For security, we won't show it again."}
			</p>
			<div className="flex items-center gap-3">
				<FancyButton.Root
					variant="neutral"
					size="small"
					className={cn(
						"min-w-[140px] justify-center overflow-hidden rounded-xl transition-all duration-200",
						loading && "pointer-events-none opacity-90",
					)}
					onClick={onGenerate}
					disabled={loading}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={loading ? "creating" : "idle"}
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
							{loading ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Creating...</span>
								</>
							) : (
								<>
									<Icon name="key-new" className="h-4 w-4 shrink-0" />
									<span>
										{mustRegenerate ? "Generate new key" : "Create API key"}
									</span>
									<ActionKbd className={actionKbdOnButtonClassName}>
										<EnterIcon />
									</ActionKbd>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
