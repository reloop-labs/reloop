import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnSolidClassName = actionKbdOnSolidClassName;

interface ModalFooterProps {
	isSubmitting: boolean;
	selectedCount: number;
	onCancel: () => void;
	onSubmit: () => void;
}

export const ModalFooter = ({
	isSubmitting,
	selectedCount,
	onCancel,
	onSubmit,
}: ModalFooterProps) => {
	return (
		<div className="flex items-center justify-end gap-3 border-stroke-soft-100 border-t px-6 py-4 dark:border-stroke-soft-100/40">
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="small"
				onClick={onCancel}
				disabled={isSubmitting}
				className={cn(
					"gap-1.5",
					isSubmitting && "pointer-events-none opacity-50",
				)}
			>
				Cancel
				<ActionKbd className="lowercase! w-auto min-w-0 px-1">esc</ActionKbd>
			</Button.Root>
			<FancyButton.Root
				type="button"
				variant="neutral"
				size="small"
				onClick={onSubmit}
				disabled={isSubmitting || selectedCount === 0}
				className="min-w-[148px] justify-center gap-1.5"
			>
				{isSubmitting ? (
					<>
						<Spinner size={14} color="currentColor" />
						<span>Adding...</span>
					</>
				) : (
					<>
						<span>
							Add{" "}
							{selectedCount > 0
								? `${selectedCount.toLocaleString()} contact${selectedCount === 1 ? "" : "s"}`
								: "contacts"}
						</span>
						<ActionKbd className={actionKbdOnSolidClassName}>
							<EnterIcon />
						</ActionKbd>
					</>
				)}
			</FancyButton.Root>
		</div>
	);
};
