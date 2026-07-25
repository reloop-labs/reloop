import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import type { useCreateWebhookForm } from "./use-create-webhook-form";
import { WebhookEventInlineSelector } from "./webhook-event-inline-selector";

type FormFieldsProps = ReturnType<typeof useCreateWebhookForm>;

export function CreateWebhookFormFields({
	form,
}: Pick<FormFieldsProps, "form">) {
	const { register, formState, setValue, watch } = form;
	const events = watch("events");

	return (
		<div className="space-y-7">
			{/* Endpoint URL */}
			<div className="space-y-2">
				<div className="flex items-center gap-1.5">
					<Label.Root htmlFor="url">
						Endpoint URL
						<Label.Asterisk />
					</Label.Root>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger type="button" tabIndex={-1}>
								<Icon
									name="info-outline"
									className="h-4 w-4 text-text-soft-400 transition-colors hover:text-text-sub-600"
								/>
							</Tooltip.Trigger>
							<Tooltip.Content side="top" size="small">
								Must be a publicly accessible HTTPS URL
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
				<Input.Root size="medium" hasError={!!formState.errors.url?.message}>
					<Input.Wrapper>
						<Input.Icon as={Icon} name="link" />
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
			<div className="space-y-2">
				<div className="flex items-center gap-1.5">
					<Label.Root htmlFor="description">
						Description
						<Label.Asterisk />
					</Label.Root>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger type="button" tabIndex={-1}>
								<Icon
									name="info-outline"
									className="h-4 w-4 text-text-soft-400 transition-colors hover:text-text-sub-600"
								/>
							</Tooltip.Trigger>
							<Tooltip.Content side="top" size="small">
								A short label to identify this endpoint
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
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

			{/* Events */}
			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5">
						<Label.Root>
							Events to subscribe
							<Label.Asterisk />
						</Label.Root>
					</div>
					{formState.errors.events?.message ? (
						<p className="text-error-base text-paragraph-xs">
							{formState.errors.events.message}
						</p>
					) : null}
				</div>
				<p className="text-paragraph-xs text-text-sub-600">
					Select the event types your endpoint should receive.
				</p>
				<WebhookEventInlineSelector
					value={events}
					onChange={(val) => setValue("events", val, { shouldValidate: true })}
				/>
			</div>
		</div>
	);
}
