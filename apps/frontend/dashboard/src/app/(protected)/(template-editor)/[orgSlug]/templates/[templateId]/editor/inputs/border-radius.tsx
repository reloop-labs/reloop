"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface RadiusInputProps {
	label: string;
	corner: "tl" | "tr" | "bl" | "br";
	placeholder?: string;
}

const RadiusInput = ({
	label,
	corner,
	placeholder = "0",
}: RadiusInputProps) => {
	const cornerStyles = {
		tl: "rounded-tl-lg",
		tr: "rounded-tr-lg",
		bl: "rounded-bl-lg",
		br: "rounded-br-lg",
	};

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<motion.div
					className="flex-1"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
				>
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<div
								className={cn(
									"h-3 w-3 border-2 border-text-sub-600",
									cornerStyles[corner],
								)}
							/>
							<Input.Input
								type="text"
								placeholder={placeholder}
								className="text-center"
							/>
						</Input.Wrapper>
					</Input.Root>
				</motion.div>
			</Tooltip.Trigger>
			<Tooltip.Content
				size="xsmall"
				side="bottom"
				variant="light"
				className="text-xs"
			>
				{label}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const InputBorderRadius = () => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Border Radius
				</Label.Root>
				<Button.Root
					variant="neutral"
					size="xsmall"
					mode="ghost"
					onClick={() => setIsExpanded(!isExpanded)}
					className={cn(
						"h-7 w-7 transition-colors",
						isExpanded && "bg-bg-weak-50 text-text-strong-950",
					)}
				>
					<Button.Icon
						as={Icon}
						name="section-rect"
						className="h-4 w-4 transition-transform"
					/>
				</Button.Root>
			</div>

			<motion.div
				layout
				className={cn(
					"grid gap-1.5",
					isExpanded ? "grid-cols-4" : "grid-cols-1",
				)}
				transition={{ duration: 0.2, ease: "easeInOut" }}
			>
				<AnimatePresence mode="popLayout">
					{isExpanded ? (
						<>
							<RadiusInput label="Top Left" corner="tl" />
							<RadiusInput label="Top Right" corner="tr" />
							<RadiusInput label="Bottom Left" corner="bl" />
							<RadiusInput label="Bottom Right" corner="br" />
						</>
					) : (
						<motion.div
							key="single"
							className="flex-1"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<Input.Root size="xsmall">
								<Input.Wrapper>
									<Input.Icon
										as={Icon}
										name="maximize-2"
										className="h-3.5 w-3.5 text-text-sub-600"
									/>
									<Input.Input
										type="text"
										placeholder="0"
										className="text-center"
									/>
									<span className="pr-2 text-text-sub-600 text-xs">px</span>
								</Input.Wrapper>
							</Input.Root>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
};
