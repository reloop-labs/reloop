import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEditorStore } from "@reloop/web/lib/email-html-editor/hooks/use-editor-store";

const navItems = [
	{ id: "visual", icon: "pencil" as const, label: "Visual editor" },
	{ id: "code", icon: "code" as const, label: "Code editor" },
] as const;

export function CenterNav() {
	const viewMode = useEditorStore((s) => s.viewMode);
	const setViewMode = useEditorStore((s) => s.setViewMode);

	const isCodeActive = viewMode === "code";

	return (
		<div className="flex items-center gap-0.5 rounded-[10px] border border-stroke-soft-100 bg-bg-weak-50/80 p-0.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.06]">
			{navItems.map((item) => {
				const isActive = item.id === "code" ? isCodeActive : !isCodeActive;
				return (
					<button
						key={item.id}
						type="button"
						title={item.label}
						onClick={() => setViewMode(item.id)}
						className={cn(
							"flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out",
							"active:scale-[0.97]",
							isActive
								? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-white/12 dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
						)}
					>
						<Icon name={item.icon} className="h-4 w-4" />
					</button>
				);
			})}
		</div>
	);
}
