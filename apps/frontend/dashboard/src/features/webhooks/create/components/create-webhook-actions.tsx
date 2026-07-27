import Link from "next/link";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";

import type { useCreateWebhookForm } from "./use-create-webhook-form";

type CreateWebhookActionsProps = Pick<
	ReturnType<typeof useCreateWebhookForm>,
	"isLoading"
>;

export function CreateWebhookActions({ isLoading }: CreateWebhookActionsProps) {
	return (
		<div className="flex items-center gap-3 lg:col-span-12">
			<Button.Root
				type="submit"
				variant="neutral"
				size="xsmall"
				disabled={isLoading}
			>
				{isLoading ? (
					<>
						<Spinner size={14} color="currentColor" />
						Creating...
					</>
				) : (
					<>
						Create webhook
						<span className="flex items-center gap-1">
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
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="xsmall"
				asChild
				disabled={isLoading}
			>
				<Link href="/webhooks">Cancel</Link>
			</Button.Root>
		</div>
	);
}
