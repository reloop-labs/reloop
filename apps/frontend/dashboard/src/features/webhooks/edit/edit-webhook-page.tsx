import {
	useWebhookDetailQuery,
} from "#/features/webhooks/hooks/use-webhooks-query";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";
import { EditWebhookFormFields } from "./components/edit-webhook-form-fields";
import { useEditWebhookForm } from "./components/use-edit-webhook-form";

interface EditWebhookPageProps {
	webhookId: string;
}

export function EditWebhookPage({ webhookId }: EditWebhookPageProps) {
	const navigate = useNavigate();
	const { data: webhook, isPending, isError } = useWebhookDetailQuery(webhookId);
	const { form, isLoading, onSubmit } = useEditWebhookForm(webhook);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!isLoading && webhook) void onSubmit();
		},
		{ enableOnFormTags: true },
	);

	const goBack = () => {
		void navigate({
			to: "/webhooks/$webhookId",
			params: { webhookId },
		});
	};

	if (isPending) {
		return (
			<div className="mx-auto w-full max-w-xl space-y-8 p-6 pb-16 lg:p-8">
				<div className="space-y-3">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-72" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-xl" />
					<Skeleton className="h-64 w-full rounded-2xl" />
				</div>
			</div>
		);
	}

	if (isError || !webhook) {
		return (
			<div className="mx-auto w-full max-w-xl space-y-6 p-6 pb-16 lg:p-8">
				<div>
					<h1 className="font-semibold text-lg text-text-strong-950 tracking-tight">
						Webhook not found
					</h1>
					<p className="mt-1 text-sm text-text-sub-600 leading-relaxed">
						This endpoint may have been deleted or you no longer have access.
					</p>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void navigate({ to: "/webhooks" })}
					className="rounded-xl"
				>
					Back to webhooks
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-xl space-y-8 p-6 pb-16 lg:p-8">
			<div>
				<div className="pt-3">
					<h1 className="font-semibold text-lg text-text-strong-950 tracking-tight">
						Edit webhook
					</h1>
					<p className="text-sm text-text-sub-600 leading-relaxed">
						Update endpoint URL, description, and subscribed events.
					</p>
				</div>
			</div>

			<form onSubmit={onSubmit}>
				<EditWebhookFormFields form={form} />

				<div className="mt-8 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={goBack}
						disabled={isLoading}
						className="rounded-xl"
					>
						Cancel
					</Button.Root>
					<FancyButton.Root
						type="submit"
						variant="blue"
						size="small"
						disabled={isLoading}
						className="min-w-[140px] gap-1.5 rounded-xl"
					>
						{isLoading ? (
							<>
								<Spinner size={14} color="currentColor" />
								Saving...
							</>
						) : (
							<>
								Save changes
								<span className="inline-flex items-center gap-0.5 opacity-80">
									<Icon
										name="command"
										className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
									/>
									<Icon
										name="enter"
										className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
									/>
								</span>
							</>
						)}
					</FancyButton.Root>
				</div>
			</form>
		</div>
	);
}
