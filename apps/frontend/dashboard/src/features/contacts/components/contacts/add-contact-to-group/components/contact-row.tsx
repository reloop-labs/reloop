import { cn } from "@reloop/ui/cn";
import type { Contact } from "../types";
import { getDisplayName, getInitial } from "./utils";

export const ContactRow = ({
	contact,
	selected,
	inGroup,
	onToggle,
	disabled,
}: {
	contact: Contact;
	selected: boolean;
	inGroup: boolean;
	onToggle: () => void;
	disabled?: boolean;
}) => {
	const initial = getInitial(contact);
	const displayName = getDisplayName(contact);
	const isLocked = inGroup || disabled;

	return (
		<button
			type="button"
			onClick={onToggle}
			disabled={isLocked}
			className={cn(
				"group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
				!isLocked && "hover:bg-bg-weak-50 dark:hover:bg-bg-weak-50/30",
				selected && !inGroup && "bg-primary-alpha-10 dark:bg-primary-base/10",
				inGroup && "opacity-60",
				isLocked && "cursor-default",
			)}
		>
			<div
				className={cn(
					"flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
					inGroup
						? "border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40"
						: selected
							? "border-primary-base bg-primary-base text-white"
							: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0",
				)}
				aria-hidden
			>
				{(selected || inGroup) && (
					<svg
						width="10"
						height="10"
						viewBox="0 0 10 10"
						fill="none"
						className={inGroup ? "text-text-soft-400" : "text-white"}
					>
						<path
							d="M2 5.2L4.1 7.2L8 2.8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</div>

			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/40 dark:text-text-soft-400">
				{initial}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-[13px] text-text-strong-950">
					{displayName}
				</p>
				<p className="truncate text-[12px] text-text-sub-600">
					{contact.email}
				</p>
			</div>

			{inGroup ? (
				<span className="shrink-0 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-bg-weak-50/30">
					In group
				</span>
			) : null}
		</button>
	);
};
