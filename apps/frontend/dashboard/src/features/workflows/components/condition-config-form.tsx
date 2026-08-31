"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import type { ConditionNodeData, ConditionOperator } from "../workflow-types";

interface ConditionConfigFormProps {
	value: ConditionNodeData;
	onChange: (data: ConditionNodeData) => void;
}

const CONTACT_FIELDS = [
	{ value: "email", label: "Email" },
	{ value: "firstName", label: "First name" },
	{ value: "lastName", label: "Last name" },
	{ value: "status", label: "Status" },
] as const;

const OPERATORS: { value: ConditionOperator; label: string }[] = [
	{ value: "eq", label: "equals" },
	{ value: "neq", label: "does not equal" },
	{ value: "contains", label: "contains" },
	{ value: "exists", label: "is set" },
	{ value: "not_exists", label: "is not set" },
	{ value: "gt", label: "greater than" },
	{ value: "lt", label: "less than" },
];

function parseSource(field: string): "contact" | "event" {
	return field.startsWith("event.") ? "event" : "contact";
}

function eventKeyFromField(field: string): string {
	return field.startsWith("event.") ? field.slice("event.".length) : "";
}

export const ConditionConfigForm = ({
	value,
	onChange,
}: ConditionConfigFormProps) => {
	const propertiesQuery = useAllPropertiesQuery();
	const customProperties = propertiesQuery.data?.properties ?? [];
	const source = parseSource(value.field ?? "");
	const needsValue =
		value.operator !== "exists" && value.operator !== "not_exists";

	const update = (patch: Partial<ConditionNodeData>) =>
		onChange({
			field: value.field ?? "",
			operator: value.operator ?? "eq",
			value: value.value ?? "",
			...patch,
		});

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-1 font-medium text-sm text-text-strong-950">
					If this is true
				</p>
				<p className="mb-3 text-text-sub-600 text-xs">
					Connect the Yes handle when it matches, No when it does not.
				</p>
			</div>

			<div className="space-y-1.5">
				<Label.Root>Check</Label.Root>
				<Select.Root
					value={source}
					onValueChange={(next) => {
						if (next === "event") {
							update({
								field: `event.${eventKeyFromField(value.field) || "plan"}`,
							});
							return;
						}
						update({ field: "status" });
					}}
				>
					<Select.Trigger className="w-full">
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="contact">Contact</Select.Item>
						<Select.Item value="event">Event property</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			{source === "contact" ? (
				<div className="space-y-1.5">
					<Label.Root>Field</Label.Root>
					<Select.Root
						value={value.field || "status"}
						onValueChange={(field) => update({ field })}
					>
						<Select.Trigger className="w-full">
							<Select.Value placeholder="Select field" />
						</Select.Trigger>
						<Select.Content>
							{CONTACT_FIELDS.map((field) => (
								<Select.Item key={field.value} value={field.value}>
									{field.label}
								</Select.Item>
							))}
							{customProperties.map((property) => (
								<Select.Item
									key={property.id}
									value={`property.${property.propertyName}`}
								>
									{property.propertyName}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</div>
			) : (
				<div className="space-y-1.5">
					<Label.Root htmlFor="condition-event-key">Event property</Label.Root>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								id="condition-event-key"
								placeholder="plan"
								value={eventKeyFromField(value.field ?? "")}
								onChange={(e) =>
									update({
										field: `event.${e.target.value.trim() || "plan"}`,
									})
								}
							/>
						</Input.Wrapper>
					</Input.Root>
					<p className="text-text-sub-600 text-xs">
						Must match a property on the tracked event, e.g.{" "}
						<span className="font-mono">plan</span>.
					</p>
				</div>
			)}

			<div className="space-y-1.5">
				<Label.Root>Operator</Label.Root>
				<Select.Root
					value={value.operator ?? "eq"}
					onValueChange={(operator) =>
						update({ operator: operator as ConditionOperator })
					}
				>
					<Select.Trigger className="w-full">
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						{OPERATORS.map((op) => (
							<Select.Item key={op.value} value={op.value}>
								{op.label}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</div>

			{needsValue ? (
				<div className="space-y-1.5">
					<Label.Root htmlFor="condition-value">Value</Label.Root>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								id="condition-value"
								placeholder="pro"
								value={value.value ?? ""}
								onChange={(e) => update({ value: e.target.value })}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			) : null}
		</div>
	);
};
