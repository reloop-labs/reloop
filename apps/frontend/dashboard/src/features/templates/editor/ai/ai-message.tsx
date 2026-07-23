import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AiPlanCard } from "./ai-plan-card";
import { AiStepCard } from "./ai-step-card";
import type { AiMessage, AiPlan } from "./types";

export function AiMessageBubble({
	message,
	onExecutePlan,
	onApplyHtml,
	onRetry,
	isRunning,
}: {
	message: AiMessage;
	onExecutePlan?: (plan: AiPlan) => void;
	onApplyHtml?: (html: string) => void;
	onRetry?: (userMessageId: string) => void;
	isRunning?: boolean;
}) {
	const isUser = message.role === "user";
	const showApply =
		!isUser &&
		Boolean(message.html) &&
		(message.status === "done" || message.status === "planned") &&
		onApplyHtml;
	const showRetry =
		!isUser && message.status === "error" && onRetry && message.error;

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

			{(showApply || showRetry) && (
				<div className="flex max-w-[95%] flex-wrap items-center gap-1.5">
					{showApply && message.html ? (
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							disabled={isRunning}
							onClick={() => onApplyHtml?.(message.html as string)}
							className="gap-1.5"
						>
							<FancyButton.Icon as={Icon} name="check" />
							Apply to canvas
						</FancyButton.Root>
					) : null}
					{showRetry ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							disabled={isRunning}
							onClick={() => {
								// Find preceding user message id is handled by parent
								onRetry?.(message.id);
							}}
							className="gap-1"
						>
							<Icon name="refresh-cw" className="h-3 w-3" />
							Retry
						</Button.Root>
					) : null}
				</div>
			)}
		</div>
	);
}
