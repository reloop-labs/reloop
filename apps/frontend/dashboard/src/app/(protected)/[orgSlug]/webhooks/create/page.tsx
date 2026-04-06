"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

import { WebhookEventInlineSelector } from "../components/webhook-event-inline-selector";

const webhookSchema = v.object({
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
	description: v.optional(v.string()),
	events: v.pipe(
		v.array(v.string("Events are required")),
		v.minLength(1, "At least one event is required"),
	),
});

type WebhookFormValues = v.InferInput<typeof webhookSchema>;

export default function CreateWebhookPage() {
	const { orgSlug } = useParams();
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const { register, handleSubmit, formState, setValue, watch, setError } =
		useForm<WebhookFormValues>({
			resolver: valibotResolver(webhookSchema),
			defaultValues: {
				url: "",
				description: "",
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
					description: data.description,
				},
				{ headers: { credentials: "include" } },
			);

			await mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);

			changeStatus("idle");
			const webhookId = response.data?.webhook?.id || response.data?.id;
			if (webhookId) {
				router.push(`/${orgSlug}/webhooks/${webhookId}`);
			} else {
				router.push(`/${orgSlug}/webhooks`);
			}
			toast.success("Webhook created successfully.");
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
					toast.error("Failed to create webhook.");
				}
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 pt-5">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button.Root variant="neutral" mode="stroke" size="xsmall" asChild>
					<Link href={`/${orgSlug}/webhooks`}>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Link>
				</Button.Root>
				<div>
					<h1 className="font-medium text-label-lg text-text-strong-950">
						Add webhook
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Send event notifications to your server in real time.
					</p>
				</div>
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="grid grid-cols-1 gap-8 lg:grid-cols-12"
			>
				{/* Left Column: Form */}
				<div className="space-y-6 lg:col-span-7">
					<div>
						<Label.Root
							htmlFor="url"
							className="mb-2 block font-medium text-label-sm text-text-strong-950"
						>
							Endpoint URL
							<Label.Asterisk />
						</Label.Root>
						<Input.Root
							size="small"
							className="w-full"
							hasError={!!formState.errors.url?.message}
						>
							<Input.Wrapper>
								<Input.Input
									id="url"
									placeholder="https://example.com/webhooks"
									{...register("url")}
								/>
							</Input.Wrapper>
						</Input.Root>
						<p className="mt-1.5 text-paragraph-xs text-text-sub-600">
							Must be a publicly accessible HTTPS URL.
						</p>
						{formState.errors.url && (
							<div className="mt-2 flex items-center gap-2">
								<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
								<p className="text-red-600 text-xs">
									{formState.errors.url.message}
								</p>
							</div>
						)}
					</div>

					<div>
						<Label.Root
							htmlFor="description"
							className="mb-2 block font-medium text-label-sm text-text-strong-950"
						>
							Description
							<span className="text-text-sub-600 text-xs"> (optional)</span>
						</Label.Root>
						<Input.Root size="small" className="w-full">
							<Input.Wrapper>
								<Input.Input
									id="description"
									placeholder="e.g. Slack notifications for order events"
									{...register("description")}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div>
						<Label.Root className="mb-2 block font-medium text-label-sm text-text-strong-950">
							Events to subscribe
							<Label.Asterisk />
						</Label.Root>
						<WebhookEventInlineSelector
							value={events}
							onChange={(val) =>
								setValue("events", val, { shouldValidate: true })
							}
							error={formState.errors.events?.message}
						/>
					</div>
				</div>

				{/* Right Column: Info & Preview */}
				<div className="space-y-5 lg:col-span-5">
					<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/60 p-5 dark:border-stroke-soft-100/40">
						<h3 className="mb-4 font-medium text-label-md text-text-strong-950">
							How it works
						</h3>
						<ul className="space-y-4">
							{[
								"An event occurs in your account",
								"We POST a signed JSON payload to your endpoint",
								"Your server responds with HTTP 2xx to acknowledge",
							].map((step, i) => (
								<li key={i} className="flex items-start gap-3">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-white-0 font-medium text-[11px] text-text-sub-600 shadow-regular-xs">
										{i + 1}
									</div>
									<p className="pt-0.5 text-paragraph-sm text-text-sub-600">
										{step}
									</p>
								</li>
							))}
						</ul>
					</div>

					<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<div className="border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
							<h3 className="font-medium text-label-sm text-text-strong-950">
								Example payload
							</h3>
						</div>
						<pre className="overflow-x-auto bg-bg-weak-50/60 p-4 text-paragraph-xs text-text-sub-600">
							<code>{`{
  "id": "evt_01HX...",
  "type": "order.created",
  "created": 1712345678,
  "data": {
    "order_id": "ord_9fk2",
    "amount": 4900,
    "currency": "usd"
  }
}`}</code>
						</pre>
					</div>
				</div>

				{/* Bottom Bar: Action Buttons */}
				<div className="flex items-center gap-3 lg:col-span-12">
					<Button.Root
						type="submit"
						variant="neutral"
						size="xsmall"
						disabled={status === "loading"}
					>
						{status === "loading" ? (
							<>
								<Spinner size={14} color="currentColor" />
								Creating...
							</>
						) : (
							<>
								Create webhook
								<Icon
									name="enter"
									className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
								/>
							</>
						)}
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						disabled={status === "loading"}
					>
						<Link href={`/${orgSlug}/webhooks`}>Cancel</Link>
					</Button.Root>
				</div>
			</form>
		</div>
	);
}
