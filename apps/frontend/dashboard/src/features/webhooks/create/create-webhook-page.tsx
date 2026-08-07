import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { CreateWebhookFormFields } from "./components/create-webhook-form-fields";
import { useCreateWebhookForm } from "./components/use-create-webhook-form";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function CreateWebhookPage() {
	const router = useRouter();
	const { form, isLoading, onSubmit } = useCreateWebhookForm();

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
						<ActionKbd className="uppercase! w-auto min-w-4 px-1">
							ESC
						</ActionKbd>
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
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</span>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</form>
		</div>
	);
}
