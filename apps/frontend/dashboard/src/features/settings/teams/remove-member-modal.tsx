
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface RemoveMemberModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void> | void;
	isRemoving: boolean;
	memberName: string;
	memberEmail: string;
}

export const RemoveMemberModal = ({
	open,
	onOpenChange,
	onConfirm,
	isRemoving: _isRemoving,
	memberName,
	memberEmail,
}: RemoveMemberModalProps) => {
	const [status, setStatus] = useState<"idle" | "removing" | "success">("idle");

	const handleRemove = async () => {
		setStatus("removing");
		try {
			await onConfirm();
			setStatus("success");
			setTimeout(() => {
				onOpenChange(false);
				setStatus("idle");
			}, 1500);
		} catch {
			setStatus("idle");
		}
	};
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="sm:max-w-[400px]" showClose={false}>
				<div className="p-5">
					<Modal.Title className="mb-2 text-label-md text-text-strong-950">
						Remove member
					</Modal.Title>
					<p className="text-paragraph-sm text-text-sub-600">
						Are you sure you want to remove{" "}
						<span className="font-medium text-text-strong-950">
							{memberName || memberEmail}
						</span>{" "}
						from this organization? They will lose access to all resources.
					</p>
				</div>

				<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
					<FancyButton.Root
						type="button"
						variant="basic"
						size="xsmall"
						onClick={() => onOpenChange(false)}
						disabled={status !== "idle"}
					>
						Cancel
						<KbdEsc />
					</FancyButton.Root>
					<FancyButton.Root
						type="button"
						variant={status === "success" ? "success" : "destructive"}
						size="xsmall"
						className={cn(
							"min-w-[140px] justify-center overflow-hidden transition-all duration-200 font-medium",
							status === "removing" && "opacity-90",
						)}
						onClick={handleRemove}
						disabled={status !== "idle"}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={status}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5 font-medium"
							>
								{status === "removing" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Removing...</span>
									</>
								) : status === "success" ? (
									<>
										<Icon name="check-circle" className="h-4 w-4" />
										<span>Removed!</span>
									</>
								) : (
									"Remove member"
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
