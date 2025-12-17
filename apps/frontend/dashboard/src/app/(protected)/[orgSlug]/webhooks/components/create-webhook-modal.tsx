"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import * as v from "valibot";

const webhookSchema = v.object({
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
});

type WebhookFormValues = v.InferInput<typeof webhookSchema>;

interface Event {
	id: string;
	name: string;
	description: string | null;
	category: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface EventListResponse {
	events: Event[];
	total: number;
	page: number;
	limit: number;
}

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
	const [selectedEventId, setSelectedEventId] = useState<string>("");

	const { data: eventsData, isLoading: eventsLoading } =
		useSWR<EventListResponse>("/api/webhook/events/list", {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		});

	const { register, handleSubmit, formState, reset, setError } =
		useForm<WebhookFormValues>({
			resolver: valibotResolver(webhookSchema) as Resolver<WebhookFormValues>,
			defaultValues: {
				url: "",
			},
		});

	const onSubmit = async (data: WebhookFormValues) => {
		if (!activeOrganization?.id) return;

		if (!selectedEventId) {
			toast.error("Please select an event");
			return;
		}

		try {
			changeStatus("loading");
			const webhookName = new URL(data.url).hostname;
			const response = await axios.post(
				"/api/webhook/v1/add",
				{
					name: webhookName,
					url: data.url,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(
				`/api/webhook/v1/list?organizationId=${activeOrganization.id}&limit=100`,
			);
			reset();
			setSelectedEventId("");
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

	const filteredEvents =
		eventsData?.events?.filter((event) => event.isActive) || [];

	const eventsByCategory = filteredEvents.reduce(
		(acc, event) => {
			if (!acc[event.category]) {
				acc[event.category] = [];
			}
			acc[event.category]?.push(event);
			return acc;
		},
		{} as Record<string, Event[]>,
	);

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
								<Label.Root className="mb-2 font-medium text-sm">
									Event
									<Label.Asterisk />
								</Label.Root>
								<Select.Root
									value={selectedEventId}
									onValueChange={setSelectedEventId}
								>
									<Select.Trigger className="w-full">
										<Select.Value placeholder="Select an event" />
									</Select.Trigger>
									<Select.Content className="w-[510px] overflow-y-auto p-0">
										{eventsLoading ? (
											<div className="flex items-center justify-center py-8">
												<Icon
													name="loader-2"
													className="h-5 w-5 animate-spin text-gray-400"
												/>
												<span className="ml-2 text-gray-600 text-sm">
													Loading events...
												</span>
											</div>
										) : Object.keys(eventsByCategory).length === 0 ? (
											<div className="py-8 text-center text-gray-500 text-sm">
												No events found
											</div>
										) : (
											Object.entries(eventsByCategory).map(
												([category, events]) => (
													<Select.Group key={category}>
														<Select.GroupLabel className="px-2 py-1.5 font-semibold text-gray-700 text-sm uppercase tracking-wider">
															{category}
														</Select.GroupLabel>
														{events.map((event) => (
															<Select.Item key={event.id} value={event.id}>
																<Icon
																	name={getEventIcon(event)}
																	className={`h-4 w-4 ${getEventIconColor(event)}`}
																/>
																<span className="font-medium text-gray-900 text-sm leading-tight">
																	{event.name}
																</span>
															</Select.Item>
														))}
													</Select.Group>
												),
											)
										)}
									</Select.Content>
								</Select.Root>
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

const getEventIcon = (event: Event) => {
	if (event.category === "email") {
		return "mail";
	}
	if (event.category === "domain") {
		return "globe";
	}
	if (event.category === "audience") {
		return "users";
	}
	return "circle-dots";
};

const getEventIconColor = (event: Event): string => {
	const operation = event.name.split(".").pop()?.toLowerCase();

	switch (operation) {
		case "create":
			return "text-green-600";
		case "update":
			return "text-amber-600";
		case "delete":
			return "text-red-600";
		case "sent":
		case "opened":
		case "clicked":
			return "text-blue-600";
		case "failed":
		case "bounced":
			return "text-red-600";
		default:
			return "text-gray-600";
	}
};
