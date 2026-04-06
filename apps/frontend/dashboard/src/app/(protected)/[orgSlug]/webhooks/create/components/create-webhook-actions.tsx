import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { useCreateWebhookForm } from "./use-create-webhook-form";

type CreateWebhookActionsProps = Pick<
	ReturnType<typeof useCreateWebhookForm>,
	"isLoading"
>;

export function CreateWebhookActions({ isLoading }: CreateWebhookActionsProps) {
	const { orgSlug } = useParams();

	return (
		<motion.div
			className="flex items-center gap-3 lg:col-span-12"
			layout
			transition={{
				type: "spring",
				stiffness: 500,
				damping: 30,
				mass: 0.5,
			}}
		>
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
				<Link href={`/${orgSlug}/webhooks`}>Cancel</Link>
			</Button.Root>
		</motion.div>
	);
}
