import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const PROJECTS = [
	{ id: "marketing", name: "Marketing" },
	{ id: "transactional", name: "Transactional" },
	{ id: "product", name: "Product Digest" },
	{ id: "onboarding", name: "Onboarding" },
];

export function ProjectSelector({
	selectedProject,
	onSelectProject,
}: {
	selectedProject: string;
	onSelectProject: (id: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const current = PROJECTS.find((p) => p.id === selectedProject) ?? PROJECTS[0];

	return (
		<Dropdown.Root open={open} onOpenChange={setOpen}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 rounded-lg px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-100 hover:text-text-strong-950 dark:hover:bg-white/10"
				>
					<span>{current?.name}</span>
					<Icon
						name="chevron-down"
						className="h-3 w-3 text-text-sub-600 opacity-60"
					/>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content align="end" className="w-40 p-1">
				{PROJECTS.map((proj) => (
					<Dropdown.Item
						key={proj.id}
						onSelect={() => onSelectProject(proj.id)}
						className="px-2.5 py-1.5 text-xs"
					>
						{proj.name}
					</Dropdown.Item>
				))}
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
