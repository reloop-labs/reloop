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
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";
import { WebhookEventSelector } from "./webhook-event-selector";

const updateWebhookSchema = v.object({
	name: v.optional(v.string("Name is required")),
	url: v.optional(
		v.pipe(
			v.string("URL is required"),
			v.minLength(1, "URL is required"),
			v.regex(
				/^https?:\/\/.+/,
				"Please enter a valid URL starting with http:// or https://",
			),
		),
	),
	status: v.optional(
		v.union([v.literal("active"), v.literal("paused"), v.literal("disabled")]),
	),
	events: v.optional(v.array(v.string("Events are required"))),
});

type UpdateWebhookFormValues = v.InferInput<typeof updateWebhookSchema>;

interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	events?: string[];
}

interface EditWebhookModalProps {
	isOpen: boolean;
	onClose: () => void;
	webhook: WebhookData;
}

export const EditWebhookModal = ({
	isOpen,
	onClose,
	webhook,
}: EditWebhookModalProps) => {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

	const { register, handleSubmit, formState, reset, setValue, watch } =
		useForm<UpdateWebhookFormValues>({
			resolver: valibotResolver(
				updateWebhookSchema,
			) as Resolver<UpdateWebhookFormValues>,
			defaultValues: {
				name: webhook.name || "",
				url: webhook.url || "",
				status: webhook.status as "active" | "paused" | "disabled",
				events: webhook.events || [],
			},
		});

	const events = watch("events") || [];

	const onSubmit = async (data: UpdateWebhookFormValues) => {
		if (!activeOrganization?.id) return;

		try {
			changeStatus("loading");
			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{
					...data,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(`/api/webhook/v1/${webhook.id}`);
			await mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);
			reset(data);
			changeStatus("idle");
			toast.success("Webhook updated successfully");
			onClose();
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				if (responseData) {
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
							Edit Webhook
						</h2>
						<div className="space-y-4">
							<div>
								<Label.Root htmlFor="name">Name</Label.Root>
								<Input.Root className="mt-1" size="small">
									<Input.Wrapper>
										<Input.Input
											className="px-2"
											id="name"
											placeholder="My Webhook"
											{...register("name")}
										/>
									</Input.Wrapper>
								</Input.Root>
								{formState.errors.name && (
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.name.message}
									</p>
								)}
							</div>
							<div>
								<Label.Root htmlFor="url">Endpoint URL</Label.Root>
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
								<Label.Root htmlFor="events">Events</Label.Root>
								<div className="mt-1">
									<WebhookEventSelector
										value={events}
										onChange={(val: string[]) =>
											setValue("events", val, { shouldValidate: true })
										}
										error={formState.errors.events?.message}
									/>
								</div>
								{formState.errors.events && (
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.events.message}
									</p>
								)}
							</div>
							<div>
								<Label.Root htmlFor="status">Status</Label.Root>
								<div className="mt-1 flex items-center gap-3">
									<select
										id="status"
										className="flex h-9 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-base disabled:cursor-not-allowed disabled:opacity-50"
										{...register("status")}
									>
										<option value="active">Active</option>
										<option value="paused">Paused</option>
										<option value="disabled">Disabled</option>
									</select>
								</div>
								{formState.errors.status && (
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.status.message}
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
									Saving...
								</>
							) : (
								<>
									Save Changes
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
