"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { motion } from "framer-motion";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import useMeasure from "react-use-measure";

interface FieldRowProps {
	label: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
	suffixDropdown?: React.ReactNode;
	hideBorder?: boolean;
}

const FieldRow = ({
	label,
	value,
	placeholder,
	onChange,
	suffixDropdown,
	hideBorder,
}: FieldRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center border-stroke-soft-100/50 border-b px-6 py-3",
				hideBorder && "border-b-0",
			)}
		>
			<label
				htmlFor={label}
				className="w-20 shrink-0 text-sm text-text-sub-600"
			>
				{label}
			</label>
			<div className="flex flex-1 items-center">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
				{suffixDropdown}
			</div>
		</div>
	);
};

const availableDomains = [
	{ value: "prolab.sh", label: "@prolab.sh" },
	{ value: "reloop.sh", label: "@reloop.sh" },
	{ value: "example.com", label: "@example.com" },
];

interface DomainDropdownProps {
	value: string;
	onChange: (value: string) => void;
}

const DomainDropdown = ({ value, onChange }: DomainDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	// Find the selected item's index
	const selectedIdx = availableDomains.findIndex((d) => d.value === value);

	// Use hover index if hovering, otherwise use selected index
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;
	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleSelect = (domainValue: string) => {
		onChange(domainValue);
		setIsOpen(false);
	};

	const selectedLabel =
		availableDomains.find((d) => d.value === value)?.label || `@${value}`;

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					className={cn(
						"flex cursor-pointer items-center gap-0.5 rounded-lg px-3 py-1 text-sm transition-colors duration-200",
						isOpen
							? "bg-neutral-alpha-10 text-text-strong-950"
							: "text-text-sub-600 hover:text-text-strong-950",
					)}
				>
					{selectedLabel}
					<Icon
						name="chevron-down"
						className={cn(
							"h-4 w-4 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
					/>
				</button>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={0}
				className="w-40 rounded-xl p-1.5"
			>
				<div className="relative">
					{availableDomains.map((domain, idx) => (
						<button
							key={domain.value}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleSelect(domain.value)}
							className={cn(
								"relative z-10 flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
								value === domain.value
									? "text-text-strong-950"
									: "text-text-sub-600",
							)}
						>
							<span>{domain.label}</span>
							{value === domain.value && (
								<Icon name="check" className="h-3 w-3 text-text-strong-950" />
							)}
						</button>
					))}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export const CenterHeader = () => {
	const [sender, setSender] = useState("Test");
	const [from, setFrom] = useState("pranavkp.me");
	const [selectedDomain, setSelectedDomain] = useState("prolab.sh");
	const [reply, setReply] = useState("pranavkp.me@outlook.com");
	const [subject, setSubject] = useState("");
	const [showDetails, setShowDetails] = useQueryState(
		"showDetails",
		parseAsBoolean,
	);

	const [ref, bounds] = useMeasure();

	return (
		<div className="relative mx-auto mt-4 max-w-2xl rounded-2xl border border-stroke-soft-100/50">
			<Button.Root
				onClick={() => setShowDetails(!showDetails)}
				mode="ghost"
				variant="neutral"
				size="xxsmall"
				className="absolute top-2 right-4"
			>
				<Button.Icon
					as={Icon}
					name="chevron-down"
					className={cn(
						"h-4 w-4 text-text-soft-400 transition-transform duration-200",
						showDetails && "rotate-180",
					)}
				/>
			</Button.Root>
			<FieldRow
				label="Sender"
				value={sender}
				onChange={setSender}
				hideBorder={!showDetails}
			/>
			<motion.div
				initial={false}
				animate={{
					height: showDetails ? bounds.height : 0,
					opacity: showDetails ? 1 : 0,
				}}
				transition={{
					height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
					opacity: { duration: 0.2, ease: "easeInOut" },
				}}
				style={{ overflow: "hidden" }}
			>
				<div ref={ref}>
					<FieldRow
						label="From"
						value={from}
						onChange={setFrom}
						suffixDropdown={
							<DomainDropdown
								value={selectedDomain}
								onChange={setSelectedDomain}
							/>
						}
					/>
					<FieldRow label="Reply" value={reply} onChange={setReply} />
					<FieldRow
						label="Subject"
						value={subject}
						placeholder="Subject line"
						onChange={setSubject}
						hideBorder
					/>
				</div>
			</motion.div>
		</div>
	);
};
