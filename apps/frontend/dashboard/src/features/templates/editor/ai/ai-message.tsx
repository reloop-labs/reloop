import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AiPlanCard } from "./ai-plan-card";
import { AiStepCard } from "./ai-step-card";
import type { AiMessage, AiPlan } from "./types";

export function AiMessageBubble({
	message,
	onExecutePlan,
	isRunning,
}: {
	message: AiMessage;
	onExecutePlan?: (plan: AiPlan) => void;
	isRunning?: boolean;
}) {
	const isUser = message.role === "user";

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-1",
				isUser ? "items-end" : "items-start",
			)}
		>
			<div
				className={cn(
					"max-w-[95%] rounded-2xl px-3 py-2 text-paragraph-xs leading-relaxed",
					isUser
						? "bg-bg-strong-950 text-static-white"
						: "border border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 dark:border-stroke-soft-100/40",
				)}
			>
				{message.attachments && message.attachments.length > 0 ? (
					<div className="mb-2 flex flex-wrap gap-1.5">
						{message.attachments.map((a) => (
							<div
								key={a.id}
								className="h-12 w-12 overflow-hidden rounded-lg border border-stroke-soft-100/30"
							>
								<img
									src={a.previewUrl || a.url}
									alt={a.name}
									className="h-full w-full object-cover"
								/>
							</div>
						))}
					</div>
				) : null}
				{message.content ? (
					<div className="whitespace-pre-wrap">{message.content}</div>
				) : message.status === "streaming" ? (
					<span className="text-text-soft-400 italic">Thinking…</span>
				) : null}
				{message.error ? (
					<p className="mt-2 text-error-base">{message.error}</p>
				) : null}
			</div>

			{!isUser && message.steps && message.steps.length > 0 ? (
				<div className="w-full max-w-[95%]">
					<AiStepCard steps={message.steps} />
				</div>
			) : null}

			{!isUser && message.plan && onExecutePlan ? (
				<div className="w-full max-w-[95%]">
					<AiPlanCard
						plan={message.plan}
						onExecute={onExecutePlan}
						disabled={isRunning}
					/>
				</div>
			) : null}

			{!isUser && message.variables && message.variables.length > 0 ? (
				<div className="flex max-w-[95%] flex-wrap gap-1">
					{message.variables.map((v) => (
						<span
							key={v}
							className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[10px] text-text-sub-600 ring-1 ring-stroke-soft-100 ring-inset"
						>
							<Icon name="brackets" className="h-2.5 w-2.5" />
							{`{{${v}}}`}
						</span>
					))}
				</div>
			) : null}
		</div>
	);
}
