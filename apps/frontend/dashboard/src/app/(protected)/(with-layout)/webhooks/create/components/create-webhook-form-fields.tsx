import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion } from "motion/react";
import type { useCreateWebhookForm } from "./use-create-webhook-form";
import { WebhookEventInlineSelector } from "./webhook-event-inline-selector";

type FormFieldsProps = ReturnType<typeof useCreateWebhookForm>;

export function CreateWebhookFormFields({
	form,
}: Pick<FormFieldsProps, "form">) {
	const { register, formState, setValue, watch } = form;
	const events = watch("events");

	return (
		<div className="space-y-6 lg:col-span-7">
			<div>
				<Label.Root
					htmlFor="url"
					className="mb-2 block font-medium text-label-sm text-text-strong-950 text-xs uppercase"
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
							placeholder="https://reloop.sh/reloop-webhooks"
							{...register("url")}
						/>
					</Input.Wrapper>
				</Input.Root>

				{formState.errors.url ? (
					<div className="mt-1.5 flex items-center gap-1">
						<Icon name="alert-circle" className="h-3 w-3 text-error-base" />
						<p className="text-error-base text-xs">
							{formState.errors.url.message}
						</p>
					</div>
				) : (
					<p className="mt-1.5 font-medium text-paragraph-xs text-text-sub-600">
						Must be a publicly accessible HTTPS URL.
					</p>
				)}
			</div>

			<div>
				<Label.Root
					htmlFor="description"
					className="mb-2 block font-medium text-label-sm text-text-strong-950 text-xs uppercase"
				>
					Description
					<span className="text-text-sub-600 text-xs capitalize">
						{" "}
						(optional)
					</span>
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
				<div className="mb-2 flex items-center justify-between">
					<Label.Root className="block font-medium text-label-sm text-text-strong-950 text-xs uppercase">
						Events to subscribe
						<Label.Asterisk />
					</Label.Root>
					{formState.errors.events?.message && (
						<div className="flex items-center gap-1">
							<Icon name="alert-circle" className="h-3 w-3 text-error-base" />
							<p className="text-error-base text-xs">
								{formState.errors.events.message}
							</p>
						</div>
					)}
				</div>
				<WebhookEventInlineSelector
					value={events}
					onChange={(val) => setValue("events", val, { shouldValidate: true })}
				/>
			</div>
		</div>
	);
}
