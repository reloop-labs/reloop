import { cn } from "@reloop/ui/cn";

/**
 * Shared toolbar control style matching the domain status dropdown
 * (`selectTriggerVariants` in base-ui-select): border-stroke-soft-200, h-9, rounded-xl.
 */
export const dataTableToolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-none",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
);
