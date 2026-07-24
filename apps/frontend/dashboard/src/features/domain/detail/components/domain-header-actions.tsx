import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Domain } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { ForwardDNSRecordsModal } from "../../add/setup/components/forward-dns-records-modal";
import { useDomainActions } from "../hooks/use-domain-actions";

interface DomainHeaderActionsProps {
	domain?: Domain;
	domainRecordId: string;
	onVerifyDNS?: () => void;
}

export const DomainHeaderActions = ({
	domain,
	domainRecordId,
	onVerifyDNS,
}: DomainHeaderActionsProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [forwardOpen, setForwardOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const { handleVerifyDNS } = useDomainActions(domainRecordId);

	const headerMenuItems = useMemo(() => {
		const items = [];

		items.push({
			id: "copy_name",
			label: "Copy Domain Name",
			icon: "copy" as const,
		});

		items.push({
			id: "copy_id",
			label: "Copy Domain ID",
			icon: "copy" as const,
		});

		items.push({
			id: "reverify",
			label: "Re-verify DNS",
			icon: "refresh-cw" as const,
		});

		items.push({
			id: "forward",
			label: "Forward Records",
			icon: "mail-single" as const,
		});

		items.push({
			id: "delete",
			label: "Delete Domain",
			icon: "trash" as const,
			isDanger: true,
		});

		return items;
	}, []);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	return (
		<>
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
					className="w-48 rounded-xl p-1.5"
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
									if (item.id === "copy_name") {
										const textToCopy = domain?.domain || domainRecordId;
										void navigator.clipboard.writeText(textToCopy);
										toast.success("Domain name copied to clipboard");
									} else if (item.id === "copy_id") {
										void navigator.clipboard.writeText(domainRecordId);
										toast.success("Domain ID copied to clipboard");
									} else if (item.id === "reverify") {
										if (onVerifyDNS) onVerifyDNS();
										else void handleVerifyDNS();
									} else if (item.id === "forward") {
										setForwardOpen(true);
									} else if (item.id === "delete") {
										void setDeleteId(domainRecordId);
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
			{domainRecordId && (
				<ForwardDNSRecordsModal
					domainId={domainRecordId}
					open={forwardOpen}
					onOpenChange={setForwardOpen}
				/>
			)}
		</>
	);
};
