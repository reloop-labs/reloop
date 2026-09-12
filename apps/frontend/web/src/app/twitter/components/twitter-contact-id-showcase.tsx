"use client";

import { Icon, type IconName } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

function DetailItem({
	icon,
	label,
	children,
}: {
	icon: IconName;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-center gap-1.5">
				<Icon
					name={icon}
					className="h-3.5 w-3.5 text-text-sub-600 dark:text-neutral-400"
				/>
				<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-neutral-400">
					{label}
				</span>
			</div>
			{children}
		</div>
	);
}

function ContactIdBadge({ id = "con_ij4wyajc4wl901234" }: { id?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(id);
		} catch {
			// fallback
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			className="group/copy w-[154px] cursor-pointer text-left"
			type="button"
			onClick={handleCopyId}
			title="Copy contact ID"
		>
			<code className="relative isolate flex h-[26px] w-full items-center justify-between gap-1.5 overflow-hidden rounded-[5px] bg-neutral-alpha-10 px-2.5 py-1 text-left font-medium font-mono text-text-strong-950 text-xs transition-colors group-hover/copy:bg-neutral-alpha-20 dark:bg-white/[0.08] dark:text-white dark:group-hover/copy:bg-white/[0.14]">
				<span className="relative flex h-full min-w-0 flex-1 items-center justify-start overflow-hidden text-left">
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={copied ? "copied" : "id"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{ opacity: 0, y: -12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 12 }}
							className="block w-full truncate text-left"
						>
							{copied ? "Copied!" : `${id.slice(0, 18)}...`}
						</motion.span>
					</AnimatePresence>
				</span>
				<span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
					<motion.span
						className="pointer-events-none absolute inset-0 flex items-center justify-center"
						initial={false}
						animate={{
							scale: copied ? 0 : 1,
							opacity: copied ? 0 : 1,
						}}
						transition={{ duration: 0.18, ease: "easeInOut" }}
					>
						<Icon
							name="copy"
							className="h-3 w-3 text-text-sub-600 transition-colors group-hover/copy:text-text-strong-950 dark:text-neutral-400 dark:group-hover/copy:text-white"
						/>
					</motion.span>
					<motion.span
						className="pointer-events-none absolute inset-0 flex items-center justify-center"
						initial={false}
						animate={{
							scale: copied ? 1 : 0,
							opacity: copied ? 1 : 0,
						}}
						transition={{ duration: 0.18, ease: "easeInOut" }}
					>
						<Icon name="check-mark" className="h-3 w-3 text-success-base" />
					</motion.span>
				</span>
			</code>
		</button>
	);
}

export function TwitterContactIdShowcase() {
	return (
		<div className="flex min-h-dvh w-full items-center justify-center bg-white p-8 antialiased">
			<DetailItem icon="hash" label="ID">
				<ContactIdBadge id="con_ij4wyajc4wl901234" />
			</DetailItem>
		</div>
	);
}
