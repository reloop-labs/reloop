import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import type { AiStep } from "./types";

const TOOL_ICONS: Record<string, string> = {
	get_editor_snapshot: "layout",
	analyze_references: "image-upload",
	create_plan: "list",
	generate_email_html: "code",
	revise_email_html: "edit-2",
	extract_variables: "brackets",
	critique_email: "award",
};

export function AiStepCard({ steps }: { steps: AiStep[] }) {
	if (!steps.length) return null;

	return (
		<div className="mt-2 space-y-1 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/80 p-2 dark:border-stroke-soft-100/40">
			<p className="px-2 pt-0.5 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wide">
				Agent steps
			</p>
			{steps.map((step) => {
				const iconName = step.tool
					? (TOOL_ICONS[step.tool] ?? "sparkling")
					: "sparkling";
				return (
					<div
						key={step.id}
						className="flex items-start gap-2 rounded-lg px-2 py-1.5"
					>
						<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
							{step.status === "running" ? (
								<Spinner size={12} />
							) : step.status === "ok" ? (
								<Icon
									name="check-circle"
									className="h-3.5 w-3.5 text-success-base"
								/>
							) : (
								<Icon
									name="alert-circle"
									className="h-3.5 w-3.5 text-error-base"
								/>
							)}
						</span>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-1.5">
								<Icon
									name={iconName}
									className="h-3 w-3 shrink-0 text-text-soft-400"
								/>
								<span
									className={cn(
										"text-paragraph-xs",
										step.status === "running"
											? "font-medium text-text-strong-950"
											: "font-medium text-text-sub-600",
									)}
								>
									{step.label}
								</span>
							</div>
							{step.summary && step.status !== "running" ? (
								<p className="mt-0.5 truncate text-[10px] text-text-soft-400">
									{step.summary}
								</p>
							) : null}
						</div>
					</div>
				);
			})}
		</div>
	);
}
