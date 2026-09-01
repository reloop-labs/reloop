"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import Link from "next/link";
import React from "react";

export interface FieldInfoDetails {
	title: string;
	description: string;
	actionText?: string;
	actionLink?: string;
}

export interface CampaignFieldRowProps {
	id?: string;
	label: string;
	children: React.ReactNode;
	hideBorder?: boolean;
	required?: boolean;
	className?: string;
	infoTooltip?: string | FieldInfoDetails | React.ReactNode;
}

export const CampaignFieldRow = ({
	id,
	label,
	children,
	hideBorder,
	required,
	className,
	infoTooltip,
}: CampaignFieldRowProps) => {
	const infoData: FieldInfoDetails | null = React.useMemo(() => {
		if (!infoTooltip) return null;
		if (typeof infoTooltip === "string") {
			return { title: label, description: infoTooltip };
		}
		if (
			typeof infoTooltip === "object" &&
			"title" in (infoTooltip as FieldInfoDetails) &&
			"description" in (infoTooltip as FieldInfoDetails)
		) {
			return infoTooltip as FieldInfoDetails;
		}
		return null;
	}, [infoTooltip, label]);

	return (
		<div
			className={cn(
				"group relative flex items-center border-stroke-soft-200 border-b py-3 dark:border-stroke-soft-100/40",
				hideBorder && "border-b-0",
				className,
			)}
		>
			{infoTooltip && (
				<div className="absolute -left-7 top-1/2 flex -translate-y-1/2 items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
					<Tooltip.Provider delayDuration={0}>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button
									type="button"
									className="flex h-5 w-5 items-center justify-center rounded text-text-soft-400 transition-colors hover:text-text-strong-950 focus:outline-none"
									tabIndex={-1}
									aria-label={`Info for ${label}`}
								>
									<Icon name="info-outline" className="h-4 w-4" />
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content
								side="left"
								variant="light"
								size="small"
								sideOffset={4}
								className="max-w-[220px] p-2"
							>
								{infoData ? (
									<div className="flex w-44 flex-col gap-1.5 text-left">
										<p className="text-paragraph-xs text-text-sub-600 leading-normal">
											{infoData.description}
										</p>

										{infoData.actionLink && infoData.actionText && (
											<div className="border-stroke-soft-200 border-t pt-1.5 dark:border-stroke-soft-100/40">
												<Link
													href={infoData.actionLink}
													className="inline-flex items-center gap-1 font-semibold text-paragraph-xs text-primary-base transition-colors hover:text-primary-hover hover:underline"
												>
													{infoData.actionText}
													<Icon name="arrow-right" className="h-3 w-3" />
												</Link>
											</div>
										)}
									</div>
								) : React.isValidElement(infoTooltip) ? (
									infoTooltip
								) : null}
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			)}
			<label
				htmlFor={id}
				className="w-20 shrink-0 select-none text-label-sm text-text-sub-600"
			>
				{label}
				{required && (
					<span className="ml-0.5 text-error-base text-paragraph-xs">*</span>
				)}
			</label>
			<div className="flex flex-1 items-center min-w-0">{children}</div>
		</div>
	);
};
