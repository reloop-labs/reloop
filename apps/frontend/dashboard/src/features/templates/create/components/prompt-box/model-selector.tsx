import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export interface ModelOption {
	id: string;
	name: string;
	description: string;
}

const MODELS: ModelOption[] = [
	{
		id: "reloop-v1",
		name: "Reloop AI (Fast)",
		description: "Best for quick layouts & emails",
	},
	{
		id: "claude-3-7",
		name: "Claude 3.7 Sonnet",
		description: "Complex responsive designs",
	},
	{
		id: "gpt-4o",
		name: "GPT-4o",
		description: "High speed & precision",
	},
];

export function ModelSelector({
	selectedModel,
	onSelectModel,
}: {
	selectedModel: string;
	onSelectModel: (id: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const current = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

	return (
		<Dropdown.Root open={open} onOpenChange={setOpen}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-100 hover:text-text-strong-950 dark:hover:bg-white/10"
				>
					<div className="flex h-4 w-4 items-center justify-center rounded border border-stroke-soft-200 text-[10px] dark:border-white/20">
						<span>⚡</span>
					</div>
					<span className="font-medium text-text-strong-950">
						{current?.name}
					</span>
					<Icon
						name="chevron-down"
						className="h-3 w-3 text-text-sub-600 opacity-60"
					/>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-56 p-1">
				{MODELS.map((model) => (
					<Dropdown.Item
						key={model.id}
						onSelect={() => onSelectModel(model.id)}
						className="flex flex-col items-start gap-0.5 px-2.5 py-1.5"
					>
						<span className="font-medium text-text-strong-950 text-xs">
							{model.name}
						</span>
						<span className="text-[10px] text-text-soft-400">
							{model.description}
						</span>
					</Dropdown.Item>
				))}
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
