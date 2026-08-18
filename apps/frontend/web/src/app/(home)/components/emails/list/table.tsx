"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type EmailItem,
	emailGridStyle,
	getAvatarGradient,
	getAvatarInitial,
	getEmailStatusColorClass,
	getEmailStatusIcon,
	getEmailStatusLabel,
} from "../_shared/data";
import { MatrixCell } from "../_shared/matrix-cell";
import { PAGE_EASE } from "../../domain/_shared/page-motion";

const FOOTER_DELAY = 0.62;
const FOOTER_DURATION = 0.38;
const LIVE_INSERT_DURATION = 0.82;
const LIVE_LAYOUT_DURATION = 0.78;
const ROW_LAYOUT_DURATION = 0.78;

export function EmailsListTable({
	emails,
	mounted,
	highlightedId,
	onRowClick,
	targetRowRef,
	targetEmailId,
	isRowPressed,
}: {
	emails: EmailItem[];
	mounted: boolean;
	highlightedId?: string | null;
	onRowClick?: (email: EmailItem) => void;
	targetRowRef?: React.RefObject<HTMLDivElement | null>;
	targetEmailId?: string | null;
	isRowPressed?: boolean;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div
				style={emailGridStyle}
				className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
			>
				<MatrixCell mounted={mounted} row={0} col={0}>
					<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
				</MatrixCell>
				<MatrixCell mounted={mounted} row={0} col={1}>
					<div className="flex items-center gap-1">
						<Icon name="user" className="h-3 w-3" />
						<span className="text-xs">To</span>
					</div>
				</MatrixCell>
				<MatrixCell mounted={mounted} row={0} col={2}>
					<div className="flex items-center gap-1">
						<Icon name="file-text" className="h-3 w-3" />
						<span className="text-xs">Subject</span>
					</div>
				</MatrixCell>
				<MatrixCell mounted={mounted} row={0} col={3}>
					<div className="flex items-center gap-1">
						<Icon name="check-circle" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
				</MatrixCell>
				<MatrixCell mounted={mounted} row={0} col={4}>
					<div className="flex items-center gap-1">
						<Icon name="clock" className="h-3 w-3" />
						<span className="text-xs">Time</span>
					</div>
				</MatrixCell>
				<MatrixCell mounted={mounted} row={0} col={5} className="justify-end">
					<span />
				</MatrixCell>
			</div>

			{/* Table Rows */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				<AnimatePresence initial={false}>
					{emails.map((email, rowIndex) => {
						const row = rowIndex + 1;
						const isHighlighted = highlightedId === email.id;
						const isLive = email.id.startsWith("em_live_");
						const isTargetRow = targetEmailId ? email.id === targetEmailId : rowIndex === 0;

						return (
							<motion.div
								key={email.id}
								layout="position"
								className="first:rounded-t-xl"
								initial={
									isLive
										? {
												opacity: 0,
												height: 0,
												y: -22,
												filter: "blur(4px)",
											}
										: { opacity: 1, height: "auto" }
								}
								animate={{
									opacity: 1,
									height: "auto",
									y: 0,
									filter: "blur(0px)",
								}}
								exit={{
									opacity: 0,
									height: 0,
									y: 10,
									filter: "blur(2px)",
									transition: { duration: 0.42, ease: PAGE_EASE },
								}}
								transition={
									isLive
										? {
												height: {
													duration: LIVE_INSERT_DURATION,
													ease: PAGE_EASE,
												},
												y: {
													duration: LIVE_INSERT_DURATION,
													ease: PAGE_EASE,
												},
												opacity: {
													duration: 0.58,
													delay: 0.16,
													ease: PAGE_EASE,
												},
												filter: {
													duration: 0.58,
													delay: 0.16,
													ease: PAGE_EASE,
												},
												layout: {
													duration: LIVE_LAYOUT_DURATION,
													ease: PAGE_EASE,
												},
											}
										: {
												duration: 0.3,
												ease: PAGE_EASE,
												layout: {
													duration: ROW_LAYOUT_DURATION,
													ease: PAGE_EASE,
												},
											}
								}
								style={{ overflow: "hidden" }}
							>
								<div
									ref={isTargetRow ? targetRowRef : undefined}
									onClick={() => onRowClick?.(email)}
									style={emailGridStyle}
									className={cn(
										"group/row grid w-full cursor-pointer items-center px-4 py-2 text-left transition-all duration-200 hover:bg-bg-weak-50",
										"first:rounded-t-xl",
										isHighlighted && "bg-neutral-100/90 dark:bg-white/[0.06]",
										isTargetRow && isRowPressed && "bg-bg-weak-50/80 scale-[0.995]",
									)}
								>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={0}
										animateWave={!isLive}
									>
										<span className="flex size-4 shrink-0 rounded-sm border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5" />
									</MatrixCell>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={1}
										animateWave={!isLive}
									>
										<div className="flex min-w-0 items-center gap-2 pr-4">
											<span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
												<span
													className={cn(
														"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
														getAvatarGradient(email.to),
													)}
												>
													{getAvatarInitial(email.to)}
												</span>
											</span>
											<span className="truncate font-medium text-label-sm text-text-strong-950">
												{email.to}
											</span>
										</div>
									</MatrixCell>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={2}
										animateWave={!isLive}
									>
										<div className="min-w-0 truncate pr-4">
											<span className="truncate font-medium text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
												{email.subject}
											</span>
										</div>
									</MatrixCell>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={3}
										animateWave={!isLive}
									>
										<div className="flex items-center">
											<AnimatePresence mode="wait" initial={false}>
												<motion.div
													key={email.status}
													initial={{ opacity: 0, y: -3, filter: "blur(1px)" }}
													animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
													exit={{ opacity: 0, y: 3, filter: "blur(1px)" }}
													transition={{ duration: 0.25, ease: "easeOut" }}
													className={cn(
														"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
														getEmailStatusColorClass(email.status),
													)}
												>
													<Icon
														name={getEmailStatusIcon(email.status)}
														className="h-3.5 w-3.5"
													/>
													{getEmailStatusLabel(email.status)}
												</motion.div>
											</AnimatePresence>
										</div>
									</MatrixCell>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={4}
										animateWave={!isLive}
									>
										<div className="flex items-center">
											<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
												{email.time}
											</span>
										</div>
									</MatrixCell>
									<MatrixCell
										mounted={mounted}
										row={row}
										col={5}
										animateWave={!isLive}
										className="justify-end"
									>
										<span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-lg">
											<Icon
												name="more-horizontal"
												className="h-3.5 w-3.5 text-text-sub-600"
											/>
										</span>
									</MatrixCell>
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>

				{/* Table Footer */}
				<motion.div
					layout="position"
					className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600"
					initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(3px)" }}
					animate={
						reduceMotion || mounted
							? { opacity: 1, y: 0, filter: "blur(0px)" }
							: { opacity: 0, y: 16, filter: "blur(3px)" }
					}
					transition={{
						duration: FOOTER_DURATION,
						delay: FOOTER_DELAY,
						ease: PAGE_EASE,
						layout: { duration: ROW_LAYOUT_DURATION, ease: PAGE_EASE },
					}}
				>
					<div className="flex items-center gap-3">
						<span>0 of 10 row(s) selected.</span>
						<button
							type="button"
							tabIndex={-1}
							className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-label-xs text-text-sub-600 uppercase outline-none"
						>
							10
							<Icon name="chevron-down" className="h-3 w-3" />
						</button>
					</div>
					<div className="flex items-center gap-1">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xxsmall"
							tabIndex={-1}
							disabled
							className="h-5 w-5 rounded-md! p-1"
						>
							<Icon name="chevron-left" className="h-3.5 w-3.5" />
						</Button.Root>
						<span className="px-2 text-text-sub-600 text-xs">
							Page 1 of 5
						</span>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xxsmall"
							tabIndex={-1}
							className="h-5 w-5 rounded-md! p-1"
						>
							<Icon name="chevron-right" className="h-3.5 w-3.5" />
						</Button.Root>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
