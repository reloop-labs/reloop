import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { useState } from "react";
import { toast } from "sonner";
import type { WebhookData } from "./types";

interface FormViewProps {
	webhookToDelete: WebhookData | null;
	validationPhrase: string;
	confirmationName: string;
	setConfirmationName: (name: string) => void;
	isDeleting: boolean;
	handleDelete: () => void;
	handleCancel: () => void;
}

export function FormView({
	webhookToDelete,
	validationPhrase,
	confirmationName,
	setConfirmationName,
	isDeleting,
	handleDelete,
	handleCancel,
}: FormViewProps) {
	const [isValidationPhraseCopied, setIsValidationPhraseCopied] =
		useState(false);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (confirmationName === validationPhrase && !isDeleting) {
					handleDelete();
				}
			}}
		>
			<div className="p-6">
				{/* Header Icon */}
				<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error-base/10">
					<Icon name="trash" className="h-4 w-4 text-error-base" />
				</div>

				<h2 className="font-medium text-text-strong-950 text-title-h5">
					Delete webhook?
				</h2>
				<p className="mb-6 text-sm text-text-sub-600 leading-relaxed">
					This will permanently delete the endpoint and all its delivery
					history. This action cannot be undone.
				</p>

				{/* Webhook Card */}
				<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-base/10 text-error-base">
						<Icon name="webhook" className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm text-text-strong-950">
							{webhookToDelete?.name || webhookToDelete?.url}
						</p>
						<p className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
							{webhookToDelete?.url}
						</p>
					</div>
				</div>

				{/* Confirmation Input */}
				<div className="mb-2">
					<p className="mb-2 text-sm text-text-sub-600">
						Type{" "}
						<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 text-xs dark:bg-bg-strong-200">
							{validationPhrase}
							<button
								type="button"
								onClick={async () => {
									try {
										await navigator.clipboard.writeText(validationPhrase);
										setIsValidationPhraseCopied(true);
										setTimeout(() => setIsValidationPhraseCopied(false), 2000);
									} catch {
										toast.error("Failed to copy webhook name");
									}
								}}
								className="text-text-sub-600 transition-colors hover:text-text-strong-950"
							>
								<Icon
									name={isValidationPhraseCopied ? "check" : "copy"}
									className={`h-3 w-3 ${isValidationPhraseCopied ? "text-success-base" : ""}`}
								/>
							</button>
						</span>{" "}
						to confirm
					</p>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								type="text"
								value={confirmationName}
								onChange={(e) => setConfirmationName(e.target.value)}
								placeholder="Type the webhook name..."
								className="font-mono text-sm"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			</div>

			<div className="flex flex-col-reverse justify-end gap-3 px-6 pb-6 sm:flex-row sm:items-center">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleCancel}
					disabled={isDeleting}
				>
					Cancel
					<KbdEsc />
				</Button.Root>
				<Button.Root
					type="submit"
					variant="error"
					size="xsmall"
					disabled={confirmationName !== validationPhrase || isDeleting}
				>
					{isDeleting ? (
						<>
							<Icon name="loader-2" className="h-4 w-4 animate-spin" />
							Deleting...
						</>
					) : (
						"Delete webhook"
					)}
				</Button.Root>
			</div>
		</form>
	);
}
