import { cn } from "@reloop/ui/cn";

/**
 * Shared control style matching `@reloop/ui` Input size="small":
 * ring-stroke-soft-100, h-9, rounded-lg.
 */
export const dataTableToolbarControlClassName = cn(
	"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-bg-white-0 px-2.5",
	"font-normal text-text-sub-600 text-xs transition duration-200 ease-out",
	"ring-1 ring-stroke-soft-100 ring-inset",
	"hover:bg-bg-weak-50 hover:text-text-strong-950",
	"dark:ring-stroke-soft-100/40",
);
