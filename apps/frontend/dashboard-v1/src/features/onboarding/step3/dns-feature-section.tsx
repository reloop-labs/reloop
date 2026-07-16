import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export function DnsFeatureSection({
	icon,
	title,
	checked,
	onCheckedChange,
	children,
	showToggle = true,
}: {
	icon: string;
	title: string;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	children?: ReactNode;
	/** When false, section is always expanded (e.g. Domain Verification). */
	showToggle?: boolean;
}) {
	const isOpen = showToggle ? Boolean(checked) : true;

	return (
		<div className="mt-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-base text-text-strong-950">
					<Icon name={icon} className="h-4 w-4 text-text-sub-600" />
					<h3 className="font-semibold">{title}</h3>
				</div>
				{showToggle && onCheckedChange !== undefined && (
					<Switch.Root checked={checked} onCheckedChange={onCheckedChange} />
				)}
			</div>
			{showToggle ? (
				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							className="mt-4 overflow-hidden"
						>
							{children}
						</motion.div>
					)}
				</AnimatePresence>
			) : (
				<div className="mt-4">{children}</div>
			)}
		</div>
	);
}
