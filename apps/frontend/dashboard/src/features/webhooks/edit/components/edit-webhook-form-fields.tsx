import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import * as Tooltip from "@reloop/ui/tooltip";
import { WebhookEventInlineSelector } from "../../components/webhook-event-inline-selector";
import type { useEditWebhookForm } from "./use-edit-webhook-form";

type FormFieldsProps = ReturnType<typeof useEditWebhookForm>;

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "disabled", label: "Disabled" },
] as const;

export function EditWebhookFormFields({
	form,
}: Pick<FormFieldsProps, "form">) {
	const { register, formState, setValue, watch } = form;
	const events = watch("events") || [];
	const currentStatus = watch("status") || "active";

	return (
		<div className="space-y-4">
			{/* Endpoint URL */}
			<div className="space-y-1">
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

			{/* Status */}
			<div className="space-y-1">
				<div className="flex items-center gap-1.5">
					<Label.Root htmlFor="status">Status</Label.Root>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger type="button" tabIndex={-1}>
								<Icon
									name="info-outline"
									className="h-4 w-4 text-text-soft-400 transition-colors hover:text-text-sub-600"
								/>
							</Tooltip.Trigger>
							<Tooltip.Content side="top" size="small">
								Paused stops deliveries without deleting the webhook
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
				<Select.Root
					value={currentStatus}
					onValueChange={(val) =>
						setValue("status", val as "active" | "paused" | "disabled", {
							shouldValidate: true,
						})
					}
				>
					<Select.Trigger id="status" className="w-full">
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						{STATUS_OPTIONS.map((option) => (
							<Select.Item key={option.value} value={option.value}>
								{option.label}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</div>

			<WebhookEventInlineSelector
				value={events}
				onChange={(val) => setValue("events", val, { shouldValidate: true })}
				error={formState.errors.events?.message}
			/>
		</div>
	);
}
