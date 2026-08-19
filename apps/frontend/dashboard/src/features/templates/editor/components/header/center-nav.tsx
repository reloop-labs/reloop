import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const pillItems = [
	{ id: "preview", icon: "eye-outline", label: "Preview" },
	{ id: "send", icon: "send-1", label: "Send" },
	{ id: "code", icon: "code", label: "Code" },
	{ id: "data", icon: "database", label: "Data" },
] as const;

type PillId = (typeof pillItems)[number]["id"];

export function CenterNav() {
	const [active, setActive] = useState<PillId>("preview");

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				title="Chat"
				className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-[background-color,color,transform] duration-150 ease-out hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.97] dark:hover:bg-white/[0.08]"
			>
				<Icon name="comment-text" className="h-4 w-4" />
			</button>

			<div className="h-4 w-px bg-stroke-soft-200 dark:bg-white/15" />

			<div className="flex items-center gap-0.5 rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50/80 p-0.5 dark:border-white/10 dark:bg-white/[0.06]">
				{pillItems.map((item) => {
					const isActive = item.id === active;
					return (
						<button
							key={item.id}
							type="button"
							title={item.label}
							onClick={() => setActive(item.id)}
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
		</div>
	);
}
