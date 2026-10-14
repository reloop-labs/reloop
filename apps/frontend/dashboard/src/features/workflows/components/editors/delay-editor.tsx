"use client";

import { useMemo, useRef, useState } from "react";
import { formatDelayAmount, parseDelayInput } from "../../delay-format";
import type { DelayNodeData, DelayUnit } from "../../workflow-types";
import { useNodeEditor } from "../node-editor-context";
import {
	EditorShell,
	MenuEmpty,
	MenuItem,
	MenuList,
	useListNav,
} from "./editor-shell";

const PRESETS: { amount: number; unit: DelayUnit }[] = [
	{ amount: 5, unit: "minutes" },
	{ amount: 30, unit: "minutes" },
	{ amount: 1, unit: "hours" },
	{ amount: 1, unit: "days" },
	{ amount: 3, unit: "days" },
	{ amount: 7, unit: "days" },
];

export const DelayEditor = ({
	nodeId,
	data,
}: {
	nodeId: string;
	data: DelayNodeData;
}) => {
	const { updateNode, closeEditor } = useNodeEditor();
	const inputRef = useRef<HTMLInputElement>(null);
	// null until the user types; the input shows the saved wait meanwhile.
	const [query, setQuery] = useState<string | null>(null);
	const current = formatDelayAmount(Number(data.amount), data.unit);
	// The input is the search: it filters by whatever it shows, prefilled or typed.
	const typed = query ?? current;
	const parsed = parseDelayInput(typed);

	// A typed duration goes first, followed by the presets it doesn't duplicate.
	const options = useMemo(() => {
		const presets = PRESETS.filter(
			(p) =>
				!typed.trim() ||
				formatDelayAmount(p.amount, p.unit).includes(
					typed.trim().toLowerCase(),
				),
		);
		if (!parsed) return presets;
		return [
			parsed,
			...presets.filter(
				(p) => p.amount !== parsed.amount || p.unit !== parsed.unit,
			),
		];
	}, [typed, parsed]);

	const apply = (value: { amount: number; unit: DelayUnit }) => {
		// Match the resting box's text so nothing flickers while it closes.
		setQuery(formatDelayAmount(value.amount, value.unit));
		updateNode(nodeId, { ...data, ...value });
		closeEditor();
	};

	const nav = useListNav(options.length, (index) => {
		const option = options[index];
		if (option) apply(option);
	});

	return (
		<EditorShell
			removable
			title="Delay"
			onBack={closeEditor}
			icon="clock"
			inputRef={inputRef}
			value={query ?? current}
			caretAtEnd={query === null}
			onChange={(v) => {
				setQuery(v);
				nav.setHighlight(0);
			}}
			placeholder="e.g. 2 days, 1h 30m"
			onKeyDown={nav.onKeyDown}
			onSubmit={() => {
				const option = options[nav.highlight];
				if (option) apply(option);
			}}
			submitDisabled={options.length === 0}
		>
			<MenuList label="Wait time">
				{options.length === 0 ? (
					<MenuEmpty>Try “10 minutes”, “2h” or “1d 12h”</MenuEmpty>
				) : (
					options.map((option, index) => {
						const label = formatDelayAmount(option.amount, option.unit);
						return (
							<MenuItem
								key={`${option.amount}-${option.unit}`}
								icon="clock"
								label={`Wait ${label}`}
								selected={
									option.amount === data.amount && option.unit === data.unit
								}
								active={index === nav.highlight}
								onHover={() => nav.setHighlight(index)}
								onSelect={() => apply(option)}
							/>
						);
					})
				)}
			</MenuList>
		</EditorShell>
	);
};
