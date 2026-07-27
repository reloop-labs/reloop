import { useRouter } from "next/navigation";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";

import { useHotkeys } from "react-hotkeys-hook";
import { CreateWebhookFormFields } from "./components/create-webhook-form-fields";
import { useCreateWebhookForm } from "./components/use-create-webhook-form";

export function CreateWebhookPage() {
	const router = useRouter();
	const { form, isLoading, onSubmit } = useCreateWebhookForm();

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!isLoading) void onSubmit();
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="mx-auto w-full max-w-xl space-y-8 p-6 pb-16 lg:p-8">
			<div>
				<div className="pt-3">
					<h1 className="font-semibold text-lg text-text-strong-950 tracking-tight">
						Create a webhook
					</h1>
					<p className="text-sm text-text-sub-600 leading-relaxed">
						Register an endpoint to receive signed event payloads in real time.
					</p>
				</div>
			</div>

			<form onSubmit={onSubmit}>
				<CreateWebhookFormFields form={form} />

				<div className="mt-8 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => router.push("/webhooks")}
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
								Creating...
							</>
						) : (
							<>
								Create webhook
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
