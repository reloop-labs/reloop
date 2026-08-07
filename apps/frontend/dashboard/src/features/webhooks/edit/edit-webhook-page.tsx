import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useWebhookDetailQuery } from "#/features/webhooks/hooks/use-webhooks-query";
import { EditWebhookFormFields } from "./components/edit-webhook-form-fields";
import { useEditWebhookForm } from "./components/use-edit-webhook-form";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface EditWebhookPageProps {
	webhookId: string;
}

export function EditWebhookPage({ webhookId }: EditWebhookPageProps) {
	const router = useRouter();
	const {
		data: webhook,
		isPending,
		isError,
	} = useWebhookDetailQuery(webhookId);
	const { form, isLoading, onSubmit } = useEditWebhookForm(webhook);

	const goBack = () => {
		router.push(`/webhooks/${webhookId}`);
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!isLoading && webhook) void onSubmit();
		},
		{ enableOnFormTags: ["INPUT"], enabled: !isLoading && !!webhook },
	);

	useHotkeys(
		"escape",
		(e) => {
			e.preventDefault();
			if (!isLoading) goBack();
		},
		{ enableOnFormTags: ["INPUT"], enabled: !isLoading },
	);

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
					onClick={() => router.push("/webhooks")}
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
										<span>Saving...</span>
									</>
								) : (
									<>
										<span>Save changes</span>
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
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
