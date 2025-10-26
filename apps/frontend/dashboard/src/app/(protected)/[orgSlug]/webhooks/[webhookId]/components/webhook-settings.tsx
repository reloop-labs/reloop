"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Switch from "@reloop/ui/switch";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const webhookUpdateSchema = v.object({
	name: v.pipe(
		v.string("Name is required"),
		v.minLength(1, "Name is required"),
		v.maxLength(100, "Name must be less than 100 characters"),
	),
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
	secret: v.optional(v.string()),
	status: v.optional(v.picklist(["active", "paused", "disabled"])),
	customHeaders: v.optional(v.string()),
	rateLimitEnabled: v.optional(v.boolean()),
	maxRequestsPerMinute: v.optional(
		v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
	),
	maxRetries: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(10))),
	retryBackoffMultiplier: v.optional(
		v.pipe(v.number(), v.minValue(1), v.maxValue(10)),
	),
});

type WebhookUpdateFormValues = v.InferInput<typeof webhookUpdateSchema>;

interface WebhookSettingsProps {
	webhook: {
		id: string;
		name: string;
		url: string;
		secret: string | null;
		status: "active" | "paused" | "disabled" | "failed";
		customHeaders: Record<string, string> | null;
		rateLimitEnabled: boolean;
		maxRequestsPerMinute: number;
		maxRetries: number;
		retryBackoffMultiplier: number;
		filteringOptions: Record<string, unknown> | null;
		createdAt: string;
		updatedAt: string;
	};
}

export const WebhookSettings = ({ webhook }: WebhookSettingsProps) => {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");

	const {
		register,
		handleSubmit,
		formState,
		setError,
		watch,
		setValue,
		reset,
	} = useForm<WebhookUpdateFormValues>({
		resolver: valibotResolver(
			webhookUpdateSchema,
		) as Resolver<WebhookUpdateFormValues>,
		defaultValues: {
			name: webhook.name,
			url: webhook.url,
			secret: webhook.secret || "",
			status: webhook.status,
			customHeaders: webhook.customHeaders
				? JSON.stringify(webhook.customHeaders, null, 2)
				: "",
			rateLimitEnabled: webhook.rateLimitEnabled,
			maxRequestsPerMinute: webhook.maxRequestsPerMinute,
			maxRetries: webhook.maxRetries,
			retryBackoffMultiplier: webhook.retryBackoffMultiplier,
		},
	});

	const rateLimitEnabled = watch("rateLimitEnabled");

	const onSubmit = async (data: WebhookUpdateFormValues) => {
		try {
			changeStatus("loading");

			// Parse custom headers if provided
			let parsedHeaders: Record<string, string> | undefined;
			if (data.customHeaders?.trim()) {
				try {
					parsedHeaders = JSON.parse(data.customHeaders);
				} catch {
					setError("customHeaders", {
						type: "manual",
						message: "Invalid JSON format for custom headers",
					});
					return;
				}
			}

			await axios.put(
				`/api/webhook/v1/${webhook.id}`,
				{
					...data,
					customHeaders: parsedHeaders,
					secret: data.secret || undefined,
				},
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/webhook/v1/${webhook.id}`);
			await mutate(
				`/api/webhook/v1/list?organizationId=${activeOrganization?.id}`,
			);
			toast.success("Webhook updated successfully");
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			toast.error(errorMessage);
		}
	};

	const handleDeleteWebhook = async () => {
		if (deleteConfirmation !== webhook.name) {
			toast.error("Please enter the webhook name to confirm deletion");
			return;
		}

		try {
			await axios.delete(`/api/webhook/v1/${webhook.id}`, {
				headers: { credentials: "include" },
			});

			toast.success("Webhook deleted successfully");
			router.push(`/${activeOrganization?.slug}/webhooks`);
		} catch (error) {
			toast.error("Failed to delete webhook");
		}
	};

	return (
		<div className="space-y-6">
			{/* General Settings */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<h3 className="mb-6 font-medium text-gray-900 text-lg">
					General Settings
				</h3>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<Label.Root htmlFor="name" className="font-medium text-sm">
								Name *
							</Label.Root>
							<Input.Root className="mt-1">
								<Input.Input
									id="name"
									placeholder="My webhook"
									{...register("name")}
								/>
							</Input.Root>
							{formState.errors.name && (
								<p className="mt-1 text-red-600 text-sm">
									{formState.errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label.Root htmlFor="url" className="font-medium text-sm">
								Endpoint URL *
							</Label.Root>
							<Input.Root className="mt-1">
								<Input.Input
									id="url"
									placeholder="https://example.com/webhook"
									{...register("url")}
								/>
							</Input.Root>
							{formState.errors.url && (
								<p className="mt-1 text-red-600 text-sm">
									{formState.errors.url.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label.Root htmlFor="secret" className="font-medium text-sm">
							Signing Secret
						</Label.Root>
						<Input.Root className="mt-1">
							<Input.Input
								id="secret"
								placeholder="Leave empty to keep current secret"
								{...register("secret")}
							/>
						</Input.Root>
						<p className="mt-1 text-gray-500 text-xs">
							Leave empty to keep the current secret unchanged.
						</p>
					</div>

					<div>
						<Label.Root htmlFor="customHeaders" className="font-medium text-sm">
							Custom Headers
						</Label.Root>
						<Input.Root className="mt-1">
							<Input.Input
								id="customHeaders"
								placeholder='{"Authorization": "Bearer token"}'
								{...register("customHeaders")}
							/>
						</Input.Root>
						<p className="mt-1 text-gray-500 text-xs">
							JSON object of custom headers to include with webhook requests.
						</p>
						{formState.errors.customHeaders && (
							<p className="mt-1 text-red-600 text-sm">
								{formState.errors.customHeaders.message}
							</p>
						)}
					</div>

					<div className="space-y-4 border-t pt-6">
						<div className="flex items-center justify-between">
							<div>
								<Label.Root className="font-medium text-sm">
									Rate Limiting
								</Label.Root>
								<p className="text-gray-500 text-xs">
									Enable rate limiting for this webhook
								</p>
							</div>
							<Switch.Root
								checked={rateLimitEnabled}
								onCheckedChange={(checked) =>
									setValue("rateLimitEnabled", checked)
								}
							/>
						</div>

						{rateLimitEnabled && (
							<div>
								<Label.Root
									htmlFor="maxRequestsPerMinute"
									className="font-medium text-sm"
								>
									Max Requests Per Minute
								</Label.Root>
								<Input.Root className="mt-1">
									<Input.Input
										id="maxRequestsPerMinute"
										type="number"
										min="1"
										max="1000"
										{...register("maxRequestsPerMinute", {
											valueAsNumber: true,
										})}
									/>
								</Input.Root>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label.Root
									htmlFor="maxRetries"
									className="font-medium text-sm"
								>
									Max Retries
								</Label.Root>
								<Input.Root className="mt-1">
									<Input.Input
										id="maxRetries"
										type="number"
										min="0"
										max="10"
										{...register("maxRetries", { valueAsNumber: true })}
									/>
								</Input.Root>
							</div>

							<div>
								<Label.Root
									htmlFor="retryBackoffMultiplier"
									className="font-medium text-sm"
								>
									Retry Backoff Multiplier
								</Label.Root>
								<Input.Root className="mt-1">
									<Input.Input
										id="retryBackoffMultiplier"
										type="number"
										min="1"
										max="10"
										step="0.1"
										{...register("retryBackoffMultiplier", {
											valueAsNumber: true,
										})}
									/>
								</Input.Root>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 border-t pt-6">
						<Button.Root
							type="button"
							variant="neutral"
							onClick={() => reset()}
							disabled={status === "loading"}
						>
							Reset
						</Button.Root>
						<Button.Root
							type="submit"
							variant="primary"
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button.Root>
					</div>
				</form>
			</div>

			{/* Danger Zone */}
			<div className="rounded-lg border border-red-200 bg-red-50 p-6">
				<h3 className="mb-2 font-medium text-lg text-red-900">Danger Zone</h3>
				<p className="mb-4 text-red-700 text-sm">
					Once you delete a webhook, there is no going back. This will
					permanently delete the webhook and all its delivery history.
				</p>
				<Button.Root
					variant="destructive"
					onClick={() => setIsDeleteModalOpen(true)}
				>
					<Icon name="trash-2" className="mr-2 h-4 w-4" />
					Delete Webhook
				</Button.Root>
			</div>

			{/* Delete Confirmation Modal */}
			<Modal.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title className="text-red-900">Delete Webhook</Modal.Title>
						<Modal.Description>
							This action cannot be undone. This will permanently delete the
							webhook and all its delivery history.
						</Modal.Description>
					</Modal.Header>

					<div className="space-y-4">
						<div>
							<Label.Root
								htmlFor="deleteConfirmation"
								className="font-medium text-sm"
							>
								Type{" "}
								<span className="rounded bg-gray-100 px-1 font-mono">
									{webhook.name}
								</span>{" "}
								to confirm
							</Label.Root>
							<Input.Root className="mt-1">
								<Input.Input
									id="deleteConfirmation"
									placeholder="Enter webhook name"
									value={deleteConfirmation}
									onChange={(e) => setDeleteConfirmation(e.target.value)}
								/>
							</Input.Root>
						</div>
					</div>

					<Modal.Footer>
						<Button.Root
							variant="neutral"
							onClick={() => setIsDeleteModalOpen(false)}
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="destructive"
							onClick={handleDeleteWebhook}
							disabled={deleteConfirmation !== webhook.name}
						>
							<Icon name="trash-2" className="mr-2 h-4 w-4" />
							Delete Webhook
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	);
};
