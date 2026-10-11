import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

export type TestState =
	| { kind: "idle" }
	| { kind: "sending" }
	| { kind: "sent"; to: string }
	| { kind: "failed"; error: string };

/** Live preview of the test email, styled like the Add Domain preview. */
export function TestEmailPreview({
	from,
	to,
	host,
	port,
	state,
}: {
	from: string;
	to: string;
	host: string;
	port: string;
	state: TestState;
}) {
	const domain = from.split("@")[1] ?? "";
	const senderName = domain.split(".")[0] || "Sender";
	const skeleton = "h-4 rounded bg-bg-weak-50";

	return (
		<div className="absolute top-24 left-4">
			<div className="w-[920px] overflow-hidden px-6 pt-5">
				<div className="mb-5 flex items-start gap-4">
					{domain ? (
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-stroke-soft-100 bg-bg-soft-200 font-bold text-sm">
							{senderName[0]?.toUpperCase()}
						</div>
					) : (
						<div className="h-10 w-10 rounded-full bg-bg-soft-200" />
					)}
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<span className="font-bold text-sm text-text-strong-950">
								Your SMTP server is connected to Reloop
							</span>
							<StatusChip state={state} />
						</div>

						<div className="relative mt-2 w-[440px]">
							<div className="relative rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 text-xs leading-relaxed dark:border-stroke-soft-100/40">
								<div className="absolute -top-1.5 left-3 h-3 w-3 rotate-45 border-stroke-soft-100 border-t border-l bg-bg-white-0 dark:border-stroke-soft-100/40" />
								<div className="grid grid-cols-[100px_1fr] gap-y-2">
									<div className="pr-3 text-right text-text-soft-400">
										from:
									</div>
									<div className="truncate font-medium text-text-strong-950">
										{from ? (
											<>
												Reloop{" "}
												<span className="font-normal text-text-sub-600">
													&lt;{from}&gt;
												</span>
											</>
										) : (
											<div className={cn(skeleton, "w-48")} />
										)}
									</div>

									<div className="pr-3 text-right text-text-soft-400">to:</div>
									<div className="truncate text-text-strong-950">
										{to || <div className={cn(skeleton, "w-40")} />}
									</div>

									<div className="pr-3 text-right text-text-soft-400">
										sent via:
									</div>
									<div className="truncate font-mono text-[11px] text-text-strong-950">
										{host ? (
											`${host}:${port || "587"}`
										) : (
											<div className={cn(skeleton, "w-36")} />
										)}
									</div>

									<div className="pr-3 text-right text-text-soft-400">
										security:
									</div>
									<div className="flex items-center gap-1.5 text-text-sub-600">
										<Icon
											name="shield-check"
											className="h-3 w-3 text-text-soft-400"
										/>
										<span>STARTTLS</span>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-4 w-[440px] rounded-lg border border-stroke-soft-100 border-dashed p-4 text-xs dark:border-stroke-soft-100/40">
							<p className="mb-2 font-semibold text-sm text-text-strong-950">
								Your SMTP server works 🎉
							</p>
							<p className="text-text-sub-600">
								This test email was sent through{" "}
								<b className="font-medium text-text-strong-950">
									{host || "your server"}
								</b>
								. Mail you send from Reloop will go through it, with templates,
								tracking, logs and webhooks still in Reloop.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatusChip({ state }: { state: TestState }) {
	const chip =
		state.kind === "sending"
			? {
					cls: "bg-bg-weak-50 text-text-sub-600",
					icon: <Spinner size={11} color="currentColor" />,
					text: "Sending…",
				}
			: state.kind === "sent"
				? {
						cls: "bg-success-lighter text-success-base",
						icon: <Icon name="check-circle" className="h-3 w-3" />,
						text: "Delivered",
					}
				: state.kind === "failed"
					? {
							cls: "bg-error-lighter text-error-base",
							icon: <Icon name="cross-circle" className="h-3 w-3" />,
							text: "Failed",
						}
					: null;

	return (
		<AnimatePresence mode="popLayout" initial={false}>
			{chip ? (
				<motion.span
					key={state.kind}
					initial={{ opacity: 0, y: -6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 6 }}
					transition={{ duration: 0.18 }}
					className={cn(
						"inline-flex h-5 items-center gap-1 rounded-full px-2 font-medium text-[11px]",
						chip.cls,
					)}
				>
					{chip.icon}
					{chip.text}
				</motion.span>
			) : null}
		</AnimatePresence>
	);
}
