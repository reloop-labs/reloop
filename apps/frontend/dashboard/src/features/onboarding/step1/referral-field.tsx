import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";
import { REFERRAL_OPTIONS } from "./referral-options";
import { SimpleIcon } from "./simple-icon";

export function ReferralField() {
	const [referral, setReferral] = useQueryState(
		"referral",
		parseAsString.withDefault(""),
	);
	const [otherReferral, setOtherReferral] = useQueryState(
		"otherReferral",
		parseAsString.withDefault(""),
	);
	const [isOpen, setIsOpen] = useState(false);
	const [hoverId, setHoverId] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState("");
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	const filteredOptions = REFERRAL_OPTIONS.filter((option) =>
		option.label.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const currentTab = hoverId
		? (buttonRefs.current[hoverId] ?? undefined)
		: undefined;
	const currentRect = currentTab?.getBoundingClientRect();
	const selectedOption = REFERRAL_OPTIONS.find((o) => o.id === referral);
	const displayLabel = selectedOption?.label || referral || "Select an option";

	return (
		<motion.div
			layout
			className={cn(
				"flex flex-col transition-all duration-200",
				referral === "other"
					? "gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4"
					: "gap-1",
			)}
		>
			<motion.div layout className="flex flex-col gap-1">
				<Label.Root htmlFor="referral">How did you hear about us?</Label.Root>
				<Popover.Root
					open={isOpen}
					onOpenChange={(open) => {
						setIsOpen(open);
						if (!open) setSearchQuery("");
					}}
				>
					<Popover.Trigger asChild>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							className="w-full justify-between gap-1.5 rounded-xl font-medium text-sm"
						>
							<span className="flex items-center gap-2">
								{selectedOption?.iconSlug && (
									<SimpleIcon
										slug={selectedOption.iconSlug}
										className="h-4 w-4"
									/>
								)}
								<span>{displayLabel}</span>
							</span>
							<Icon name="chevron-down" className="h-4 w-4 shrink-0" />
						</Button.Root>
					</Popover.Trigger>
					<Popover.Content
						align="start"
						showArrow={false}
						unstyled
						style={{ width: "var(--radix-popover-trigger-width)" }}
						className="z-50 flex flex-col rounded-2xl bg-bg-white-0 p-1.5 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
					>
						<div className="flex h-10 items-center gap-2.5 border-stroke-soft-100/80 border-b px-3 pb-1">
							<Icon name="search" className="h-4 w-4 text-text-soft-400" />
							<input
								type="text"
								placeholder="Search sources..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full bg-transparent font-medium text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
								// biome-ignore lint/a11y/noAutofocus: match existing onboarding UX
								autoFocus
							/>
						</div>
						<div className="scrollbar-hide relative flex max-h-[380px] flex-col overflow-y-auto">
							{filteredOptions.map((option) => {
								const isChecked = referral === option.id;
								return (
									<button
										key={option.id}
										ref={(el) => {
											buttonRefs.current[option.id] = el;
										}}
										type="button"
										onPointerEnter={() => setHoverId(option.id)}
										onPointerLeave={() => setHoverId(undefined)}
										onClick={() => {
											setReferral(option.id);
											setIsOpen(false);
										}}
										className={cn(
											"relative z-10 flex h-12 w-full cursor-pointer items-center justify-between gap-3.5 rounded-lg px-3.5 font-medium text-sm transition-colors",
											"text-text-strong-950",
											isChecked && "bg-neutral-alpha-10",
										)}
									>
										<span className="flex items-center gap-3.5 text-left">
											{option.iconSlug && (
												<SimpleIcon
													slug={option.iconSlug}
													className="h-5 w-5"
												/>
											)}
											<span>{option.label}</span>
										</span>
										{isChecked && (
											<Icon
												name="check"
												className="h-4 w-4 shrink-0 text-text-strong-950"
											/>
										)}
									</button>
								);
							})}
							{filteredOptions.length === 0 && (
								<div className="flex flex-col items-center justify-center px-4 py-6 text-center">
									<Icon
										name="search"
										className="mb-1.5 h-6 w-6 text-text-soft-400"
									/>
									<p className="font-medium text-text-soft-400 text-xs">
										No results found
									</p>
								</div>
							)}
							{filteredOptions.length > 0 && (
								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab}
								/>
							)}
						</div>
					</Popover.Content>
				</Popover.Root>
			</motion.div>
			<AnimatePresence initial={false}>
				{referral === "other" && (
					<motion.div
						layout
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="flex flex-col gap-1 overflow-hidden"
					>
						<Label.Root htmlFor="other-referral">Please specify</Label.Root>
						<Input.Root size="small" className="rounded-xl bg-bg-white-0">
							<Input.Wrapper>
								<Input.Input
									id="other-referral"
									type="text"
									value={otherReferral}
									className="font-medium"
									onChange={(e) => {
										setOtherReferral(e.target.value);
									}}
									placeholder="e.g. Product Hunt, Reddit, etc."
								/>
							</Input.Wrapper>
						</Input.Root>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
