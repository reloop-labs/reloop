import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

interface SuccessViewProps {
	displayWebhookName: string | null;
	handleCancel: () => void;
}

export function SuccessView({
	displayWebhookName,
	handleCancel,
}: SuccessViewProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 text-center sm:p-10">
			<div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-base text-text-white-0 dark:bg-success-base/20 dark:text-success-base">
				<Icon name="check" className="h-7 w-7" />
			</div>
			<Modal.Title className="mb-3 font-medium text-text-strong-950 text-title-h5">
				Webhook deleted
			</Modal.Title>
			<p className="mb-8 text-sm text-text-sub-600 leading-relaxed sm:max-w-[320px]">
				<span className="font-medium text-text-strong-950">
					{displayWebhookName}
				</span>{" "}
				and all its delivery history have been permanently removed.
			</p>
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="medium"
				onClick={handleCancel}
				className="w-full"
			>
				Back to webhooks
			</Button.Root>
		</div>
	);
}
