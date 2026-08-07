import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { useCreateWebhookForm } from "./use-create-webhook-form";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type CreateWebhookActionsProps = Pick<
	ReturnType<typeof useCreateWebhookForm>,
	"isLoading"
>;

export function CreateWebhookActions({ isLoading }: CreateWebhookActionsProps) {
	return (
		<div className="flex items-center justify-end gap-3 lg:col-span-12">
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="small"
				asChild
				disabled={isLoading}
				className="rounded-xl"
			>
				<Link href="/webhooks">
					Cancel
					<ActionKbd className="w-auto min-w-4 px-1 uppercase!">
						ESC
					</ActionKbd>
				</Link>
			</Button.Root>
			<FancyButton.Root
				type="submit"
				variant="blue"
				size="small"
				disabled={isLoading}
				className="min-w-[140px] gap-1.5 overflow-hidden rounded-xl"
			>
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.span
						key={isLoading ? "loading" : "idle"}
						transition={{
							type: "spring",
							duration: 0.25,
							bounce: 0,
						}}
						initial={{
							opacity: 0,
							y: -14,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							y: 14,
						}}
						className="flex items-center justify-center gap-1.5"
					>
						{isLoading ? (
							<>
								<Spinner size={14} color="currentColor" />
								<span>Creating...</span>
							</>
						) : (
							<>
								<span>Create webhook</span>
								<span className="inline-flex items-center gap-1">
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</span>
							</>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</div>
	);
}
