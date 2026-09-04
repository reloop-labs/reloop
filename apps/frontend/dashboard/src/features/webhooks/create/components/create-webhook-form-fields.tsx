import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { WebhookEventInlineSelector } from "../../components/webhook-event-inline-selector";
import type { useCreateWebhookForm } from "./use-create-webhook-form";

type FormFieldsProps = ReturnType<typeof useCreateWebhookForm>;

export function CreateWebhookFormFields({
	form,
}: Pick<FormFieldsProps, "form">) {
	const { register, formState, setValue, watch } = form;
	const events = watch("events");

	return (
		<div className="space-y-4">
			{/* Endpoint URL */}
			<div className="space-y-1">
				<Label.Root htmlFor="url">
					Endpoint URL
					<Label.Asterisk />
				</Label.Root>
				<Input.Root size="medium" hasError={!!formState.errors.url?.message}>
					<Input.Wrapper>
						<Input.Input
							id="url"
							placeholder="https://example.com/webhooks/reloop"
							autoFocus
							{...register("url")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{formState.errors.url ? (
					<p className="text-error-base text-paragraph-xs">
						{formState.errors.url.message}
					</p>
				) : null}
			</div>

			{/* Description */}
			<div className="space-y-1">
				<Label.Root htmlFor="description">
					Description
					<Label.Asterisk />
				</Label.Root>
				<Input.Root
					size="medium"
					hasError={!!formState.errors.description?.message}
				>
					<Input.Wrapper>
						<Input.Input
							id="description"
							placeholder="e.g. Slack notifications for order events"
							{...register("description")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{formState.errors.description ? (
					<p className="text-error-base text-paragraph-xs">
						{formState.errors.description.message}
					</p>
				) : null}
			</div>
			<WebhookEventInlineSelector
				value={events}
				onChange={(val) => setValue("events", val, { shouldValidate: true })}
				error={formState.errors.events?.message}
			/>
		</div>
	);
}
