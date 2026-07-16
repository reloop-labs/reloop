import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { ModalHeader } from "../modal-header";

export function ConfirmStep({
	displayName,
	keyPreview,
	isRotating,
	onClose,
	onRotate,
}: {
	displayName: string;
	keyPreview: string;
	isRotating: boolean;
	onClose: () => void;
	onRotate: () => void;
}) {
	return (
		<div className="flex flex-col">
			<ModalHeader
				title="Rotate API key"
				icon="rotate-cw"
				iconClassName="text-orange-500"
				onClose={onClose}
			/>

			<Modal.Body className="space-y-4 px-5 py-4 pb-5">
				<p className="text-sm text-text-sub-600 leading-relaxed">
					This invalidates the current secret immediately and issues a new one.
					Anything still using the old key will stop working until you update
					it.
				</p>

				<div className="flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
						<Icon name="key-new" className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm text-text-strong-950">
							{displayName}
						</p>
						<p className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
							{keyPreview}
						</p>
					</div>
				</div>
			</Modal.Body>

			<div className="flex items-center justify-end gap-2 border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={onClose}
					disabled={isRotating}
					className="gap-1.5"
				>
					Cancel
					<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px] text-text-sub-600">
						Esc
					</span>
				</Button.Root>
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={onRotate}
					disabled={isRotating}
					className="gap-2"
				>
					{isRotating ? (
						<>
							<Spinner size={12} color="currentColor" />
							Rotating…
						</>
					) : (
						<>
							Rotate key
							<span className="inline-flex items-center gap-0.5">
								<Icon
									name="command"
									className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
								/>
								<Icon
									name="enter"
									className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
								/>
							</span>
						</>
					)}
				</Button.Root>
			</div>
		</div>
	);
}
