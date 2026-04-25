"use client";

import { Icon } from "@reloop/ui/icon";

interface ModalHeaderProps {
	title: string;
	subtitle: string;
	onClose: () => void;
	showCloseIcon?: boolean;
}

export const ModalHeader = ({
	title,
	subtitle,
	onClose,
	showCloseIcon = true,
}: ModalHeaderProps) => {
	return (
		<div className="flex items-start justify-between border-stroke-soft-100 border-b px-5 pt-5 pb-4 dark:border-stroke-soft-100/40">
			<div className="flex items-start gap-3">
				<div>
					<h2 className="font-semibold text-label-md text-text-strong-950">
						{title}
					</h2>
					<p className="-mt-0.5 text-paragraph-sm text-text-sub-600">
						{subtitle}
					</p>
				</div>
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
	);
};
