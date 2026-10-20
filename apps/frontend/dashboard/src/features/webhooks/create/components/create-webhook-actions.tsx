import { cn } from "@reloop/ui/cn";
import * as Button from "@reloop/ui/button";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ActionKbd, actionKbdOnSolidClassName } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { useCreateWebhookForm } from "./use-create-webhook-form";

const actionKbdOnBlueClassName = cn(actionKbdOnSolidClassName, "w-auto min-w-4 px-1");

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
				className="gap-1.5 rounded-xl"
			>
				<Link href="/webhooks">
					Cancel
					<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
				</Link>
			</Button.Root>
			<FancyButton.Root
				type="submit"
				variant="neutral"
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
									<ActionKbd className={actionKbdOnBlueClassName}>
										<EnterIcon />
									</ActionKbd>
								</span>
							</>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</div>
	);
}
