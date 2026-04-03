"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

import { WebhookEventSelector } from "./webhook-event-selector";

const webhookSchema = v.object({
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
	events: v.pipe(
		v.array(v.string("Events are required")),
		v.minLength(1, "At least one event is required"),
	),
});

type WebhookFormValues = v.InferInput<typeof webhookSchema>;

interface CreateWebhookModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateWebhookModal = ({
	isOpen,
	onClose,
}: CreateWebhookModalProps) => {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState,
		reset,
		setError,
		setValue,
		watch,
	} = useForm<WebhookFormValues>({
		resolver: valibotResolver(webhookSchema) as Resolver<WebhookFormValues>,
		defaultValues: {
			url: "",
			events: [],
		},
	});

	const events = watch("events");

	const onSubmit = async (data: WebhookFormValues) => {
		if (!activeOrganization?.id) return;

		try {
			changeStatus("loading");
			const response = await axios.post(
				"/api/webhook/v1/",
				{
					url: data.url,
					events: data.events,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);
			reset();
			changeStatus("idle");
			onClose();
			const webhookId = response.data?.webhook?.id || response.data?.id;
			if (webhookId) {
				router.push(`/${activeOrganization.slug}/webhooks/${webhookId}`);
			}
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				if (responseData) {
					setError("url", {
						type: "server",
						message: responseData,
					});
				} else {
					toast.error(responseData);
				}
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={onClose}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<form onSubmit={handleSubmit(onSubmit)}>
					<Modal.Body>
						<h2 className="mb-6 font-semibold text-gray-900 text-xl">
							Create Webhook
						</h2>
						<div className="space-y-3">
							<div>
								<Label.Root htmlFor="url">
									Endpoint URL
									<Label.Asterisk />
								</Label.Root>
								<Input.Root className="mt-1" size="small">
									<Input.Wrapper>
										<Input.Input
											className="px-2"
											id="url"
											placeholder="https://example.com/webhook"
											{...register("url")}
										/>
									</Input.Wrapper>
								</Input.Root>
								{formState.errors.url && (
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.url.message}
									</p>
								)}
							</div>
							<div>
								<Label.Root htmlFor="events">
									Events
									<Label.Asterisk />
								</Label.Root>
								<p className="mb-1 text-text-sub-600 text-xs">
									Select the events you want to listen to.
								</p>
								<WebhookEventSelector
									value={events}
									onChange={(val: string[]) =>
										setValue("events", val, { shouldValidate: true })
									}
									error={formState.errors.events?.message}
								/>
								{formState.errors.events && (
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.events.message}
									</p>
								)}
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={onClose}
							disabled={status === "loading"}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									Create Webhook
									<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
