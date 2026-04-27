"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import type { Domain } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";

interface DomainHeaderActionsProps {
	domain?: Domain;
	domainRecordId: string;
}

export const DomainHeaderActions = ({
	domain,
	domainRecordId,
}: DomainHeaderActionsProps) => {
	const { domainId: _domainId } = useParams();
	const [, setDeleteId] = useQueryState("delete");
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const headerMenuItems = useMemo(() => {
		const items = [];

		items.push({
			id: "docs",
			label: "Documentation",
			icon: "book-closed" as const,
		});

		items.push({
			id: "delete",
			label: "Delete Domain",
			icon: "trash" as const,
			isDanger: true,
		});

		return items;
	}, [domain?.nameservers, domain?.status]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	return (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<Button.Root variant="neutral" mode="stroke" size="xsmall">
					<Icon
						name="more-horizontal"
						className="h-3.5 w-3.5 text-text-sub-600"
					/>
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={0}
				className="w-44 rounded-xl p-1.5"
				showArrow
			>
				<div className="relative">
					{headerMenuItems.map((item, idx) => (
						<button
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => {
								if (item.id === "delete") {
									setDeleteId((domainRecordId || _domainId) as string);
								}
								if (item.id === "docs") {
									window.open("https://reloop.sh/docs/domain", "_blank");
								}
							}}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-medium text-[13px] transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
							)}
						>
							<Icon
								name={item.icon}
								className={cn(
									"h-3.5 w-3.5",
									item.isDanger ? "" : "text-text-sub-600",
								)}
							/>
							<span>{item.label}</span>
						</button>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</PopoverContent>
		</PopoverRoot>
	);
};
