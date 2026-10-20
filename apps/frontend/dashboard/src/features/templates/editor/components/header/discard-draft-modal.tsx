import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd, actionKbdOnSolidClassName } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the red/destructive FancyButton fill. */
const actionKbdOnRedClassName = actionKbdOnSolidClassName;

type DiscardState = "idle" | "discarding" | "success";

interface DiscardDraftModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
	/** Label of the published version the draft reverts to, e.g. "v3". */
	publishedLabel: string;
}

export const DiscardDraftModal = ({
	isOpen,
	onClose,
	onConfirm,
	publishedLabel,
}: DiscardDraftModalProps) => {
	const [state, setState] = useState<DiscardState>("idle");
	const stateRef = useRef(state);

	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => setState("idle"), 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const handleDiscard = async () => {
		if (state !== "idle") return;
		try {
			setState("discarding");
			await onConfirm();
			setState("success");
			setTimeout(onClose, 300);
		} catch {
			setState("idle");
		}
	};

	useHotkeys(
		["enter", "mod+enter"],
		(e) => {
			e.preventDefault();
			void handleDiscard();
		},
		{ enabled: isOpen },
	);

	useHotkeys(
		"escape",
		() => {
			if (state === "idle") onClose();
		},
		{ enabled: isOpen },
	);

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && stateRef.current !== "discarding") onClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px]"
				showClose={false}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Discard draft changes
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						The editor, subject, from address, reply-to and preview text will be
						reset to the published version ({publishedLabel}). Unpublished edits
						are lost for everyone editing this template.
					</Modal.Description>
				</div>

				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => {
							if (state === "idle") onClose();
						}}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							state !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						onClick={() => void handleDiscard()}
						className={cn(
							"relative min-w-[150px] select-none justify-center overflow-hidden transition-all duration-200",
							state !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={state}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{state === "discarding" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Discarding…</span>
									</>
								) : state === "success" ? (
									<>
										<Icon
											name="check"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Discarded</span>
									</>
								) : (
									<>
										Discard changes
										<ActionKbd className={actionKbdOnRedClassName}>
											<EnterIcon />
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
