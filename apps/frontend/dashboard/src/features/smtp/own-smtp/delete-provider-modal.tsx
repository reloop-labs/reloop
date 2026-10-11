"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import { toast } from "@reloop/ui/toast";
import { ModalHeader } from "#/features/api-keys/modals/modal-header";
import {
	apiErrorMessage,
	type SmtpProvider,
	useDeleteSmtpProvider,
} from "./use-smtp-providers";

export function DeleteProviderModal({
	provider,
	onClose,
}: {
	provider: SmtpProvider | null;
	onClose: () => void;
}) {
	const remove = useDeleteSmtpProvider();

	const onDelete = async () => {
		if (!provider) return;
		try {
			await remove.mutateAsync(provider.id);
			toast.success(`${provider.name} deleted`);
			onClose();
		} catch (err) {
			toast.error(apiErrorMessage(err, "Failed to delete SMTP server"));
		}
	};

	return (
		<Modal.Root open={!!provider} onOpenChange={(o) => !o && onClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[440px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<ModalHeader
					title="Delete SMTP server"
					subtitle={provider?.host}
					icon="trash"
					iconClassName="text-error-base"
					onClose={onClose}
				/>
				<div className="space-y-3 px-5 pt-4 pb-5">
					<p className="text-paragraph-sm text-text-sub-600">
						<span className="font-medium text-text-strong-950">
							{provider?.name}
						</span>{" "}
						and its saved credentials will be removed. Domains added only for it
						are removed too; other domains go back to sending through Reloop.
					</p>
					{provider && provider.domains.length > 0 ? (
						<div className="flex flex-wrap gap-1.5">
							{provider.domains.map((d) => (
								<span
									key={d.id}
									className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/20"
								>
									{d.domain}
								</span>
							))}
						</div>
					) : null}
					<div className="flex justify-end gap-2 pt-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={onClose}
							className="rounded-xl"
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="destructive"
							size="small"
							onClick={() => void onDelete()}
							disabled={remove.isPending}
							className="rounded-xl"
						>
							{remove.isPending ? "Deleting…" : "Delete"}
						</FancyButton.Root>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
