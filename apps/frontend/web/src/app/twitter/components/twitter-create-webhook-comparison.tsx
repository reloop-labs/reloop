"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { AnimatePresence, motion } from "framer-motion";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function Kbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-4 min-w-4 items-center justify-center rounded-[5px] border border-stroke-soft-200 bg-bg-weak-50 px-1 text-[10px] leading-none text-text-sub-600 shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
				className,
			)}
		>
			{children}
		</span>
	);
}

function CreateWebhookOld() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-bg-white-0 dark:bg-[#0c0c0c]">
			<div className="mx-auto w-full space-y-6 p-6">
				<div className="space-y-4">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-stroke-soft-100/40">
						<Icon name="chevron-left" className="h-4 w-4" />
					</div>
					<div>
						<h1 className="font-semibold text-title-h6 text-text-strong-950 leading-8 dark:text-white">
							Add webhook
						</h1>
						<p className="font-medium text-paragraph-sm text-text-sub-600 dark:text-white/60">
							Send event notifications to your server in real time.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8">
					<div className="space-y-6">
						<div className="space-y-2">
							<Label.Root className="block font-medium text-label-sm text-text-strong-950 text-xs uppercase dark:text-white">
								Endpoint URL <Label.Asterisk />
							</Label.Root>
							<Input.Root size="small" className="w-full" hasError={false}>
								<Input.Wrapper>
									<Input.Input
										placeholder="https://reloop.sh/reloop-webhooks"
										defaultValue="https://example.com/webhooks"
										readOnly
									/>
								</Input.Wrapper>
							</Input.Root>
							<p className="font-medium text-paragraph-xs text-text-sub-600 dark:text-white/60">
								Must be a publicly accessible HTTPS URL.
							</p>
						</div>

						<div className="space-y-2">
							<Label.Root className="block font-medium text-label-sm text-text-strong-950 text-xs uppercase dark:text-white">
								Description{" "}
								<span className="text-text-sub-600 text-xs capitalize dark:text-white/60">
									(optional)
								</span>
							</Label.Root>
							<Input.Root size="small" className="w-full">
								<Input.Wrapper>
									<Input.Input
										placeholder="e.g. Slack notifications for order events"
										defaultValue=""
										readOnly
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div className="space-y-2">
							<Label.Root className="block font-medium text-label-sm text-text-strong-950 text-xs uppercase dark:text-white">
								Events to subscribe <Label.Asterisk />
							</Label.Root>
							<div className="h-64 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
								<div>
									<div className="sticky top-0 flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-[#111]">
										<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-widest dark:text-white/60">
											Domains
										</span>
									</div>
									<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
										<div className="flex items-center justify-between bg-bg-weak-50/60 px-4 py-2.5">
											<div className="flex items-center gap-3">
												<span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#0A438A] text-white">
													<Icon name="check" className="h-3 w-3" />
												</span>
												<span className="font-medium text-label-sm text-text-strong-950 dark:text-white">
													domain.created
												</span>
											</div>
											<span className="rounded-full bg-[#0A438A] px-1.5 py-0.5 font-medium text-[10px] text-white">
												Domain
											</span>
										</div>
										<div className="flex items-center justify-between px-4 py-2.5">
											<div className="flex items-center gap-3">
												<span className="h-4 w-4 rounded-[4px] border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10" />
												<span className="font-medium text-label-sm text-text-strong-950 dark:text-white">
													domain.updated
												</span>
											</div>
											<span className="rounded-full bg-[#0A438A] px-1.5 py-0.5 font-medium text-[10px] text-white">
												Domain
											</span>
										</div>
									</div>
								</div>
								<div>
									<div className="sticky top-0 flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-[#111]">
										<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-widest dark:text-white/60">
											Email
										</span>
									</div>
									<div className="flex items-center justify-between px-4 py-2.5">
										<div className="flex items-center gap-3">
											<span className="h-4 w-4 rounded-[4px] border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10" />
											<span className="font-medium text-label-sm text-text-strong-950 dark:text-white">
												email.sent
											</span>
										</div>
										<span className="rounded-full bg-[#7C3AED] px-1.5 py-0.5 font-medium text-[10px] text-white">
											Email
										</span>
									</div>
								</div>
								<div>
									<div className="sticky top-0 flex items-center gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40 dark:bg-[#111]">
										<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-widest dark:text-white/60">
											Contacts
										</span>
									</div>
									<div className="flex items-center justify-between px-4 py-2.5">
										<div className="flex items-center gap-3">
											<span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#0A6B3A] text-white">
												<Icon name="check" className="h-3 w-3" />
											</span>
											<span className="font-medium text-label-sm text-text-strong-950 dark:text-white">
												contact.created
											</span>
										</div>
										<span className="rounded-full bg-[#0A6B3A] px-1.5 py-0.5 font-medium text-[10px] text-white">
											Contact
										</span>
									</div>
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-50 p-3 dark:border-stroke-soft-100/40">
								<div className="mb-2 flex items-center gap-1.5">
									<Icon name="check-circle" className="h-3.5 w-3.5 text-green-600" />
									<span className="font-medium text-label-xs text-text-strong-950 dark:text-white">
										2 events selected
									</span>
								</div>
								<div className="flex flex-wrap gap-1.5">
									<span className="rounded-full bg-[#0A438A] px-2 py-0.5 font-medium text-[11px] text-white">
										domain.created
									</span>
									<span className="rounded-full bg-[#0A6B3A] px-2 py-0.5 font-medium text-[11px] text-white">
										contact.created
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="border-t border-stroke-soft-100 dark:border-stroke-soft-100/40" />

					<div className="flex items-center gap-3">
						<Button.Root type="button" variant="neutral" size="xsmall">
							Create webhook
							<Icon name="command" className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px" />
							<Icon name="enter" className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px" />
						</Button.Root>
						<Button.Root variant="neutral" mode="stroke" size="xsmall" asChild>
							<span>Cancel</span>
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
}

function CreateWebhookNew() {
	return (
		<div className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-bg-white-0 p-0 dark:bg-[#0c0c0c]">
			<div className="relative rounded-2xl bg-bg-white-0 px-6 pt-5 pb-6 dark:bg-[#0c0c0c]">
				<div className="pt-1">
					<h1 className="font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
						Create a webhook
					</h1>
					<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
						Register an endpoint to receive signed event payloads in real time.
					</p>
				</div>

				<div className="mt-6 space-y-4">
					<div className="space-y-1">
						<div className="flex items-center gap-1.5">
							<Label.Root htmlFor="url-new" className="font-medium text-xs dark:text-white">
								Endpoint URL <Label.Asterisk />
							</Label.Root>
							<Icon name="info-outline" className="h-4 w-4 text-text-soft-400" />
						</div>
						<Input.Root size="medium" hasError={false} className="rounded-xl">
							<Input.Wrapper>
								<Input.Input
									id="url-new"
									placeholder="https://example.com/webhooks/reloop"
									defaultValue="https://example.com/webhooks/reloop"
									readOnly
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-1.5">
							<Label.Root className="font-medium text-xs dark:text-white">
								Description <Label.Asterisk />
							</Label.Root>
							<Icon name="info-outline" className="h-4 w-4 text-text-soft-400" />
						</div>
						<Input.Root size="medium" className="rounded-xl">
							<Input.Wrapper>
								<Input.Input
									placeholder="e.g. Slack notifications for order events"
									defaultValue=""
									readOnly
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					{/* Dashboard-identical Events to subscribe card — copied from webhook-event-inline-selector.tsx */}
					<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
						<div className="m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 pt-4 pb-3 dark:border-stroke-soft-100/40">
							<div className="flex items-start justify-between gap-3">
								<div>
									<Label.Root>
										Events to subscribe <Label.Asterisk />
									</Label.Root>
									<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
										Select the event types your endpoint should receive.
									</p>
								</div>
								<span className="shrink-0 rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 tabular-nums dark:bg-bg-weak-50/50">
									2 selected
								</span>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{(
									[
										{ id: "all", label: "All" },
										{ id: "email-send", label: "Send Email" },
										{ id: "email-receive", label: "Receive Email" },
										{ id: "contact", label: "Contacts" },
									] as const
								).map((chip) => {
									const active = chip.id === "all";
									return (
										<span
											key={chip.id}
											className={cn(
												"rounded-full px-3 py-1 font-medium text-[12px] transition-colors",
												active
													? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
													: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:bg-bg-weak-50/40",
											)}
										>
											{chip.label}
										</span>
									);
								})}
							</div>
							<div className="max-h-[280px] space-y-1 overflow-y-auto pr-0.5">
								{[
									{
										id: "email.sent",
										cat: "Send Email",
										icon: "mail-send",
										desc: "Triggered when an email is successfully sent.",
										checked: true,
									},
									{
										id: "email.received",
										cat: "Receive Email",
										icon: "inbox",
										desc: "Inbound email received on your domain.",
										checked: false,
									},
									{
										id: "contact.created",
										cat: "Contacts",
										icon: "contacts",
										desc: "A new contact is added to your audience.",
										checked: true,
									},
								].map((ev) => (
									<div
										key={ev.id}
										className={cn(
											"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
											ev.checked
												? "border-stroke-soft-200 bg-bg-weak-50 shadow-regular-xs dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40"
												: "border-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-stroke-soft-100/40",
										)}
									>
										<span
											className={cn(
												"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
												ev.checked
													? "border-text-strong-950 bg-text-strong-950 text-white dark:border-white dark:bg-white dark:text-black"
													: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50",
											)}
										>
											{ev.checked ? <Icon name="check" className="h-3 w-3" /> : null}
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-medium font-mono text-[13px] text-text-strong-950">
													{ev.id}
												</span>
												<span className="inline-flex items-center gap-1 rounded-md bg-bg-soft-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-bg-weak-50/50">
													<Icon name={ev.icon as never} className="h-3 w-3" />
													{ev.cat}
												</span>
											</div>
											<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
												{ev.desc}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="flex items-center justify-between px-4 py-2.5">
							<span className="font-medium text-[12px] text-text-sub-600">2 events selected</span>
							<span className="text-[11px] text-text-soft-400 tabular-nums">3 shown</span>
						</div>
					</div>
				</div>
			</div>

			<div className="relative flex items-center justify-between gap-3 px-1 pt-4">
				<Button.Root type="button" variant="neutral" mode="ghost" size="small" className="gap-1.5">
					Cancel
					<Kbd className="lowercase w-auto min-w-0 px-1">esc</Kbd>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					className="min-w-[140px] justify-center gap-1.5 overflow-hidden rounded-xl"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key="idle"
							transition={{ type: "spring", duration: 0.25, bounce: 0 }}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center justify-center gap-1.5"
						>
							<span>Create webhook</span>
							<Kbd className={cn(actionKbdOnBlueClassName, "ml-0")}>↵</Kbd>
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}

export function TwitterCreateWebhookComparison() {
	return (
		<div data-standalone="true" className="flex min-h-dvh w-full items-center justify-center bg-white p-6 dark:bg-[#080808]">
			<div className="mx-auto flex w-full max-w-[1024px] flex-col items-stretch justify-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-0">
				<div className="flex w-full flex-1 justify-center lg:justify-end">
					<div className="w-full max-w-[460px]">
						<CreateWebhookOld />
					</div>
				</div>
				{/* Divider between old and new */}
				<div className="hidden shrink-0 self-stretch px-8 lg:flex lg:items-stretch">
					<div className="w-px bg-stroke-soft-100 dark:bg-white/10" aria-hidden />
				</div>
				<div className="h-px w-full bg-stroke-soft-100 dark:bg-white/10 lg:hidden" aria-hidden />
				<div className="flex w-full flex-1 justify-center lg:justify-start">
					<div className="w-full max-w-[460px]">
						<CreateWebhookNew />
					</div>
				</div>
			</div>
		</div>
	);
}
