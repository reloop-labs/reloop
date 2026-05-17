"use client";

import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

interface ModalHeaderProps {
	title: string;
	subtitle?: string;
	icon?: string;
	iconClassName?: string;
	onClose: () => void;
	showCloseIcon?: boolean;
}

export const ModalHeader = ({
	title,
	subtitle,
	icon,
	iconClassName = "text-text-strong-950",
	onClose,
	showCloseIcon = true,
}: ModalHeaderProps) => {
	return (
		<div className="flex flex-col border-stroke-soft-100 border-b dark:border-stroke-soft-100/40">
			<div className="flex items-start justify-between px-5 pt-5 pb-4">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2.5">
						{icon && (
							<Icon name={icon} className={`h-4 w-4 ${iconClassName}`} />
						)}
						<Modal.Title asChild>
							<h2 className="font-semibold text-label-md text-text-strong-950">
								{title}
							</h2>
						</Modal.Title>
					</div>
					{subtitle && (
						<p className="text-paragraph-xs text-text-sub-600">{subtitle}</p>
					)}
				</div>
				{showCloseIcon && (
					<button
						type="button"
						onClick={onClose}
						className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50"
					>
						<Icon name="cross" className="h-3.5 w-3.5" />
					</button>
				)}
			</div>
		</div>
	);
};
