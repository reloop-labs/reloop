"use client";

import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import { useQuery } from "@tanstack/react-query";
import { useNodes } from "@xyflow/react";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import { queryKeys } from "#/lib/query-keys";
import { listCustomEvents } from "../../hooks/use-custom-events-api";
import {
	type ConditionNodeData,
	type ConditionOperator,
	isTriggerNode,
	type WorkflowNode,
} from "../../workflow-types";
import { VALUELESS_OPERATORS } from "../../workflow-validation";
import { CreateEventModal } from "../create-event-modal";
import { useNodeEditor } from "../node-editor-context";
import {
	CONTACT_FIELDS,
	canonicalField,
	conditionValueText,
	describeCondition,
} from "../nodes/condition-node";
import { StepIcon } from "../step-icon";
import {
	EditorShell,
	MenuEmpty,
	MenuItem,
	MenuList,
	useListNav,
} from "./editor-shell";

const OPERATORS: {
	value: ConditionOperator;
	label: string;
	/** Shown in a small tile left of the label. */
	symbol: string;
}[] = [
	{ value: "eq", label: "equals", symbol: "=" },
	{ value: "neq", label: "does not equal", symbol: "≠" },
	{ value: "contains", label: "contains", symbol: "∋" },
	{ value: "starts_with", label: "starts with", symbol: "a…" },
	{ value: "ends_with", label: "ends with", symbol: "…z" },
	{ value: "exists", label: "is set", symbol: "∃" },
	{ value: "not_exists", label: "is not set", symbol: "∄" },
	{ value: "is_empty", label: "is empty", symbol: "∅" },
	{ value: "gt", label: "greater than", symbol: ">" },
	{ value: "gte", label: "at least", symbol: "≥" },
	{ value: "lt", label: "less than", symbol: "<" },
	{ value: "lte", label: "at most", symbol: "≤" },
];

const needsValue = (op: ConditionOperator | null) =>
	op !== null && !VALUELESS_OPERATORS.has(op);

type Stage = "field" | "operator" | "value";

type FieldOption = {
	value: string;
	label: string;
	meta: string;
	/** Property to add to the trigger's event before picking this field. */
	create?: string;
};

/** Small gray tile left of a menu label: an operator symbol or a field's source icon. */
const OptionTile = ({ children }: { children: ReactNode }) => (
	<span
		aria-hidden
		className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bg-weak-50 font-mono text-[13px] text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:bg-white/[0.06]"
	>
		{children}
	</span>
);

/** Where a field comes from, shown as its tile icon. */
const sourceIcon = (field: string) =>
	field.startsWith("contact.") ? "user" : "zap";
const fieldIcon = (option: FieldOption) =>
	option.create ? "plus" : sourceIcon(option.value);

const isValidPropertyName = (name: string) =>
	/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);

const Chip = ({
	children,
	icon,
	onClick,
}: {
	children: string;
	/** Same mark as the option's tile in the menu. */
	icon?: ReactNode;
	onClick: () => void;
}) => (
	<button
		type="button"
		onMouseDown={(e) => e.preventDefault()}
		onClick={(e) => {
			e.stopPropagation();
			onClick();
		}}
		className="inline-flex min-w-0 max-w-[150px] shrink-0 items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[12px] text-text-strong-950 transition-colors hover:border-stroke-sub-300 dark:border-stroke-soft-100/50 dark:bg-white/[0.05]"
	>
		{icon ? (
			<span
				aria-hidden
				className="flex shrink-0 items-center text-text-sub-600"
			>
				{icon}
			</span>
		) : null}
		<span className="truncate">{children}</span>
	</button>
);

export const ConditionEditor = ({
	nodeId,
	data,
}: {
	nodeId: string;
	data: ConditionNodeData;
}) => {
	const { updateNode, closeEditor } = useNodeEditor();
	const inputRef = useRef<HTMLInputElement>(null);
	const propertiesQuery = useAllPropertiesQuery();
	const customProperties = propertiesQuery.data?.properties ?? [];
	// Properties of the event that starts this automation.
	const trigger = useNodes<WorkflowNode>().find(isTriggerNode)?.data;
	const eventsQuery = useQuery({
		queryKey: queryKeys.workflows.events(),
		queryFn: () => listCustomEvents(100),
	});
	const triggerEvent = eventsQuery.data?.events.find((e) =>
		trigger?.eventId ? e.id === trigger.eventId : e.key === trigger?.eventKey,
	);

	// An `and`/`or` group (made through the API) can't be edited here yet: the
	// editor starts a fresh single rule, which replaces it once saved.
	const isGroup = data.type === "and" || data.type === "or";
	const [field, setField] = useState<string | null>(
		isGroup
			? null
			: data.field?.trim()
				? canonicalField(data.field.trim())
				: null,
	);
	const [operator, setOperator] = useState<ConditionOperator | null>(
		!isGroup && data.field?.trim() ? (data.operator ?? null) : null,
	);
	const [stage, setStage] = useState<Stage>(() => {
		if (!field) return "field";
		if (!operator) return "operator";
		return needsValue(operator) ? "value" : "operator";
	});
	const [query, setQuery] = useState(() => {
		if (stage === "value") return conditionValueText(data.value);
		if (stage === "operator") {
			return OPERATORS.find((o) => o.value === operator)?.label ?? "";
		}
		return "";
	});
	// Until the user types, the caret sits at the end of the prefilled text.
	const [touched, setTouched] = useState(false);

	const goTo = (next: Stage, nextQuery = "") => {
		setStage(next);
		setQuery(nextQuery);
		setTouched(false);
		nav.setHighlight(0);
		inputRef.current?.focus();
	};

	const commit = (
		nextField: string,
		nextOperator: ConditionOperator,
		value: string,
	) => {
		updateNode(nodeId, {
			...data,
			// Saving here always makes a single rule (drops any API-made group).
			type: undefined,
			rules: undefined,
			field: nextField,
			operator: nextOperator,
			value: needsValue(nextOperator) ? value : "",
		});
		closeEditor();
	};

	const trimmed = query.trim();
	/** The input is the search: lists filter by whatever it shows. */
	const filter = trimmed;

	const fieldOptions = useMemo<FieldOption[]>(() => {
		const option = (value: string, meta: string) => ({
			value,
			label: value,
			meta,
		});
		const contactNames = [
			// Not email: it's passed in with the trigger that enrolls the contact.
			...CONTACT_FIELDS.filter((name) => name !== "email"),
			...customProperties
				.map((p) => p.propertyName)
				.filter((name) => !CONTACT_FIELDS.includes(name)),
		];
		const all: FieldOption[] = [
			...contactNames.map((name) => option(`contact.${name}`, "Contact")),
			...(triggerEvent?.properties ?? []).map((p) =>
				option(`trigger.${p.name}`, "Trigger"),
			),
		];
		const q = filter.toLowerCase();
		const matches = q
			? all.filter((f) => f.label.toLowerCase().includes(q))
			: all;
		if (!q || /^contact\./i.test(filter)) return matches;
		// A name the trigger doesn't send yet: add it to the trigger's event
		// right here, or (with no event chosen) just check the raw payload.
		const name = filter.replace(/^trigger\./, "");
		const typed = `trigger.${name}`;
		if (!name || matches.some((m) => m.value === typed)) return matches;
		return triggerEvent && isValidPropertyName(name)
			? [
					...matches,
					{
						value: typed,
						label: `Add “${name}” to ${triggerEvent.name}`,
						meta: "New",
						create: name,
					},
				]
			: [...matches, option(typed, "Trigger")];
	}, [customProperties, triggerEvent, filter]);

	const operatorOptions = useMemo(() => {
		const q = filter.toLowerCase();
		return q
			? OPERATORS.filter((o) => o.label.includes(q) || o.value === q)
			: OPERATORS;
	}, [filter]);

	// "Add <name>": open the trigger's event so the property (type, default)
	// can be set up there; once saved, it becomes this condition's field.
	const [adding, setAdding] = useState<string | null>(null);

	const pickField = (option: FieldOption) => {
		if (option.create && triggerEvent) {
			setAdding(option.create);
			return;
		}
		setField(option.value);
		goTo("operator");
	};

	const pickOperator = (op: ConditionOperator) => {
		setOperator(op);
		if (!field) return goTo("field");
		if (!needsValue(op)) return commit(field, op, "");
		goTo("value", operator === op ? conditionValueText(data.value) : "");
	};

	const count =
		stage === "field"
			? fieldOptions.length
			: stage === "operator"
				? operatorOptions.length
				: 1;

	const nav = useListNav(count, (index) => {
		if (stage === "field") {
			const option = fieldOptions[index];
			if (option) pickField(option);
		} else if (stage === "operator") {
			const option = operatorOptions[index];
			if (option) pickOperator(option.value);
		} else if (field && operator && trimmed) {
			commit(field, operator, trimmed);
		}
	});

	const operatorLabel = OPERATORS.find((o) => o.value === operator)?.label;
	const preview =
		field && operator
			? describeCondition({ field, operator, value: trimmed })
			: null;

	return (
		<>
			<EditorShell
				removable
				title="Condition"
				onBack={closeEditor}
				icon="split-route"
				inputRef={inputRef}
				value={query}
				caretAtEnd={!touched}
				onChange={(v) => {
					setQuery(v);
					setTouched(true);
					nav.setHighlight(0);
				}}
				placeholder={
					stage === "field"
						? "Search fields"
						: stage === "operator"
							? "Operator"
							: "Value"
				}
				mono={stage !== "operator"}
				prefix={
					stage === "field" ? null : (
						<>
							{field ? (
								<Chip
									icon={
										<StepIcon name={sourceIcon(field)} className="h-3 w-3" />
									}
									onClick={() => goTo("field", field)}
								>
									{field}
								</Chip>
							) : null}
							{stage === "value" && operatorLabel ? (
								<Chip
									icon={OPERATORS.find((o) => o.value === operator)?.symbol}
									onClick={() => goTo("operator", operatorLabel)}
								>
									{operatorLabel}
								</Chip>
							) : null}
						</>
					)
				}
				onKeyDown={(e) => {
					if (e.key === "Backspace" && query === "") {
						e.preventDefault();
						if (stage === "value") goTo("operator", operatorLabel ?? "");
						else if (stage === "operator") goTo("field", field ?? "");
						return;
					}
					nav.onKeyDown(e);
				}}
				onSubmit={nav.submit}
				submitDisabled={stage === "value" ? !trimmed : count === 0}
			>
				{stage === "field" ? (
					<MenuList label="Fields">
						{fieldOptions.length === 0 ? (
							<MenuEmpty>Type a contact or trigger property</MenuEmpty>
						) : (
							fieldOptions.map((option, index) => (
								<MenuItem
									key={option.value}
									label={
										<span className="flex items-center gap-2.5">
											<OptionTile>
												<StepIcon
													name={fieldIcon(option)}
													className="h-3.5 w-3.5"
												/>
											</OptionTile>
											<span className="truncate">{option.label}</span>
										</span>
									}
									mono={!option.create}
									meta={option.meta}
									selected={option.value === field}
									active={index === nav.highlight}
									onHover={() => nav.setHighlight(index)}
									onSelect={() => pickField(option)}
								/>
							))
						)}
					</MenuList>
				) : stage === "operator" ? (
					<MenuList label="Operators">
						{operatorOptions.length === 0 ? (
							<MenuEmpty>No operator matches “{trimmed}”</MenuEmpty>
						) : (
							operatorOptions.map((option, index) => (
								<MenuItem
									key={option.value}
									label={
										<span className="flex items-center gap-2.5">
											<OptionTile>{option.symbol}</OptionTile>
											{option.label}
										</span>
									}
									selected={option.value === operator}
									active={index === nav.highlight}
									onHover={() => nav.setHighlight(index)}
									onSelect={() => pickOperator(option.value)}
								/>
							))
						)}
					</MenuList>
				) : (
					<MenuList label="Condition">
						{trimmed && preview ? (
							<MenuItem
								icon="split-route"
								label={preview}
								mono
								meta={<EnterIcon />}
								active
								onSelect={() =>
									field && operator && commit(field, operator, trimmed)
								}
							/>
						) : (
							<MenuEmpty>
								<span className={cn("font-mono")}>
									{field} {operatorLabel}
								</span>{" "}
								… type a value
							</MenuEmpty>
						)}
					</MenuList>
				)}
			</EditorShell>

			<CreateEventModal
				open={adding !== null}
				event={triggerEvent}
				initialProperty={adding ?? undefined}
				onOpenChange={(open) => {
					if (!open) setAdding(null);
				}}
				onUpdated={(event) => {
					// Use the new property unless it was renamed or removed in the modal.
					const name = adding;
					if (name && event.properties.some((p) => p.name === name)) {
						setField(`trigger.${name}`);
						goTo("operator");
					}
				}}
			/>
		</>
	);
};
