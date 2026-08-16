"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import type { Ref } from "react";
import { ActionKbd, actionKbdOnBlueClassName } from "../_shared/action-kbd";
import { DomainPreview } from "../_shared/domain-preview";
import { MotionItem, MotionStage } from "../_shared/page-motion";

function RecommendRow({
	ok,
	title,
	detail,
}: {
	ok: boolean;
	title: string;
	detail?: string;
}) {
	return (
		<div className="flex items-start gap-2 text-text-sub-600 text-xs">
			<Icon
				name="check-circle"
				className={
					ok
						? "mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500"
						: "mt-0.5 h-3.5 w-3.5 shrink-0 text-text-soft-400"
				}
			/>
			<div>
				<div>{title}</div>
				{detail ? (
					<div className="text-text-soft-400 text-xs">{detail}</div>
				) : null}
			</div>
		</div>
	);
}

export function DomainAddPage({
	domain,
	isLoading,
	inputWrapRef,
	submitRef,
	submitPressed,
}: {
	domain: string;
	isLoading?: boolean;
	inputWrapRef?: Ref<HTMLDivElement>;
	submitRef?: Ref<HTMLDivElement>;
	submitPressed?: boolean;
}) {
	const domainParts = domain.split(".").filter(Boolean);
	const isValid =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
			domain,
		);
	const isSubdomain = isValid && domainParts.length > 2;
	const rootDomain =
		domainParts.length >= 2 ? domainParts.slice(-2).join(".") : "example.com";

	return (
		<MotionStage className="mx-auto grid h-full w-full max-w-5xl overflow-hidden lg:grid-cols-2">
			<div className="mx-auto w-full max-w-md px-6 py-10 lg:px-8 lg:py-12">
				<MotionItem className="pb-4">
					<h1 className="font-semibold text-title-h6 leading-8">Add Domain</h1>
					<p className="text-text-sub-600 text-xs">
						Send emails from a domain you control
					</p>
				</MotionItem>

				<div className="mt-6 flex w-full flex-col">
					<MotionItem>
					<section className="space-y-1">
						<div className="space-y-1">
							<div className="block font-medium text-sm text-text-strong-950">
								Domain Name
								<span className="text-error-base">*</span>
							</div>
						</div>
						<div className="relative">
							<div ref={inputWrapRef}>
								<Input.Root className="w-full rounded-xl" size="small">
									<Input.Wrapper>
										<Input.Input
											readOnly
											tabIndex={-1}
											value={domain}
											placeholder="send.example.com"
										/>
										{isSubdomain ? (
											<Input.Icon>
												<Icon name="check" className="h-4 w-4 text-green-500" />
											</Input.Icon>
										) : domainParts.length > 0 ? (
											<Input.Icon>
												<Icon
													name="alert-triangle"
													className="h-4 w-4 text-orange-500"
												/>
											</Input.Icon>
										) : null}
									</Input.Wrapper>
								</Input.Root>
							</div>

							<div className="mt-2 space-y-2">
								<div className="font-medium text-text-sub-600 text-xs">
									Domain Recommendations:
								</div>
								<div className="space-y-1.5">
									<RecommendRow
										ok={isSubdomain}
										title="Use a subdomain"
										detail={`(e.g., mail.${rootDomain}, send.${rootDomain}, m.${rootDomain})`}
									/>
									<RecommendRow
										ok={isSubdomain}
										title="Avoid using your root domain"
									/>
									<RecommendRow ok={isValid} title="Valid domain format" />
								</div>
							</div>
						</div>
					</section>
					</MotionItem>

					<MotionItem className="mt-2 w-full">
						<button
							type="button"
							tabIndex={-1}
							className="flex w-full cursor-pointer items-center gap-1.5 py-1 outline-none"
						>
							<span className="font-medium text-sm text-text-strong-950">
								Advanced options
							</span>
							<Icon
								name="chevron-down"
								className="size-4 shrink-0 text-text-sub-600"
							/>
						</button>
					</MotionItem>

					<MotionItem className="mt-5 flex items-center gap-3">
						<div
							ref={submitRef}
							className={cn(
								"inline-flex transition-transform duration-100 ease-out",
								submitPressed && "scale-[0.97]",
							)}
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								tabIndex={-1}
								className={cn(
									"min-w-[134px] justify-center overflow-hidden rounded-xl transition-all duration-200",
									isLoading && "pointer-events-none opacity-90",
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={isLoading ? "loading" : "idle"}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center justify-center gap-1.5"
									>
										{isLoading ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Adding Domain...</span>
											</>
										) : (
											<>
												<span>Add Domain</span>
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							tabIndex={-1}
							className="gap-1.5 rounded-xl"
						>
							Cancel
							<span className="inline-flex items-center gap-0.5">
								<ActionKbd className="w-auto min-w-0 px-1">⌘</ActionKbd>
								<ActionKbd className="w-auto min-w-4 px-1">⌫</ActionKbd>
							</span>
						</Button.Root>
					</MotionItem>
				</div>
			</div>

			<MotionItem className="relative hidden overflow-hidden lg:block">
				<DomainPreview domain={domain} variant="domain" />
			</MotionItem>
		</MotionStage>
	);
}
