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
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const webhookSchema = v.object({
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

	const { register, handleSubmit, formState, setError, watch, setValue } =
		useForm<WebhookFormValues>({
			resolver: valibotResolver(webhookSchema) as Resolver<WebhookFormValues>,
			defaultValues: {
				name: "",
				url: "",
				secret: "",
				customHeaders: "",
				rateLimitEnabled: true,
				maxRequestsPerMinute: 60,
				maxRetries: 3,
				retryBackoffMultiplier: 2,
			},
		});

	const rateLimitEnabled = watch("rateLimitEnabled");

	const onSubmit = async (data: WebhookFormValues) => {
		if (!activeOrganization?.id) return;

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

			await axios.post(
				"/api/webhook/v1/add",
				{
					...data,
					customHeaders: parsedHeaders,
					secret: data.secret || undefined,
				},
				{ headers: { credentials: "include" } },
			);

			await mutate(
				`/api/webhook/v1/list?organizationId=${activeOrganization.id}`,
			);
			toast.success("Webhook created successfully");
			onClose();
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			toast.error(errorMessage);
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={onClose}>
			<Modal.Content className="max-w-2xl">
				<Modal.Header>
					<Modal.Title>Create Webhook</Modal.Title>
					<Modal.Description>
						Set up a new webhook to receive real-time events and notifications.
					</Modal.Description>
				</Modal.Header>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
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

						<div>
							<Label.Root htmlFor="secret" className="font-medium text-sm">
								Signing Secret
							</Label.Root>
							<Input.Root className="mt-1">
								<Input.Input
									id="secret"
									placeholder="Leave empty to auto-generate"
									{...register("secret")}
								/>
							</Input.Root>
							<p className="mt-1 text-gray-500 text-xs">
								Used to verify webhook authenticity. Leave empty to
								auto-generate.
							</p>
						</div>

						<div>
							<Label.Root
								htmlFor="customHeaders"
								className="font-medium text-sm"
							>
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

						<div className="space-y-4 border-t pt-4">
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
					</div>

					<Modal.Footer>
						<Button.Root
							type="button"
							variant="neutral"
							onClick={onClose}
							disabled={status === "loading"}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							variant="primary"
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Webhook"
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
