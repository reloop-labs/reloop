"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Braces, Plus } from "lucide-react";
import { useEditorStore } from "./use-editor-store";

interface VariablesDropdownProps {
	query: string;
	editor: any;
	range: any;
	clientRect?: (() => DOMRect | null) | DOMRect | null;
	command: (props: { name: string }) => void;
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((r) => r.json());

export const VariablesDropdown = forwardRef((props: VariablesDropdownProps, ref) => {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	const { data: templateData } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher
	);

	const rawVars = templateData?.variables ?? [];
	const variables = rawVars
		.map((v: any) => {
			if (typeof v === "string") {
				return v.replace(/^\{\{|\}\}$/g, "").trim();
			}
			return v?.name ?? "";
		})
		.filter(Boolean);

	const [selectedIndex, setSelectedIndex] = useState(0);

	// Filter based on the query typed after '{{'
	const filtered = variables.filter((v: string) =>
		v.toLowerCase().includes(props.query.toLowerCase())
	);

	// Keyboard navigation support
	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }: { event: KeyboardEvent }) => {
			if (event.key === "ArrowDown") {
				setSelectedIndex((selectedIndex + 1) % (filtered.length + 1));
				return true;
			}

			if (event.key === "ArrowUp") {
				setSelectedIndex(
					(selectedIndex - 1 + filtered.length + 1) % (filtered.length + 1)
				);
				return true;
			}

			if (event.key === "Enter") {
				selectItem(selectedIndex);
				return true;
			}

			return false;
		},
	}));

	useEffect(() => {
		setSelectedIndex(0);
	}, [props.query, filtered.length]);

	const selectItem = (index: number) => {
		if (index < filtered.length) {
			const name = filtered[index];
			props.command({ name });
		} else {
			// "+ Create new variable" option
			// Clear query trigger from editor first
			const { editor, range } = props;
			editor.chain().focus().deleteRange(range).run();

			// Open global create variable modal
			useEditorStore.getState().setIsCreatingVar(true);
		}
	};

	return (
		<div className="z-50 min-w-[220px] rounded-xl border border-[#333333] bg-[#222222] p-1.5 shadow-2xl select-none">
			{/* Category Heading to match Slash Command Panelette style */}
			<div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#888888] uppercase">
				Variables
			</div>

			{filtered.length === 0 ? (
				<div className="px-2.5 py-1.5 text-xs italic text-[#666666]">
					No matching variables
				</div>
			) : (
				filtered.map((item: string, index: number) => {
					const isSelected = index === selectedIndex;
					return (
						<button
							key={item}
							type="button"
							onClick={() => selectItem(index)}
							className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
								isSelected
									? "bg-[#383838] text-white"
									: "text-[#d1d1d6] hover:bg-[#2c2c2c] hover:text-white"
							}`}
						>
							<Braces size={12} className={`shrink-0 ${isSelected ? "text-white" : "text-[#777777]"}`} />
							<span className="truncate">{item}</span>
						</button>
					);
				})
			)}

			<div className="my-1 border-t border-[#333333]" />

			{/* Create Option */}
			<button
				type="button"
				onClick={() => selectItem(filtered.length)}
				className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
					selectedIndex === filtered.length
						? "bg-[#383838] text-white"
						: "text-[#d1d1d6] hover:bg-[#2c2c2c] hover:text-white"
				}`}
			>
				<Plus size={12} className="shrink-0" />
				<span className="truncate">Create new variable...</span>
			</button>
		</div>
	);
});

VariablesDropdown.displayName = "VariablesDropdown";
