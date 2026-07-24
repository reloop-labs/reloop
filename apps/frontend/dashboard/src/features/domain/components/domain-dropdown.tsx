import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { ForwardDNSRecordsModal } from "../add/setup/components/forward-dns-records-modal";
import { useDomainActions } from "../detail/hooks/use-domain-actions";

const menuItems = [
	{
		id: "view" as const,
		label: "View Details",
		icon: "info-outline" as const,
		isDanger: false,
	},
	{
		id: "copy_name" as const,
		label: "Copy Domain Name",
		icon: "copy" as const,
		isDanger: false,
	},
	{
		id: "copy_id" as const,
		label: "Copy Domain ID",
		icon: "copy" as const,
		isDanger: false,
	},
	{
		id: "reverify" as const,
		label: "Re-verify DNS",
		icon: "refresh-cw" as const,
		isDanger: false,
	},
	{
		id: "forward" as const,
		label: "Forward Records",
		icon: "mail-single" as const,
		isDanger: false,
	},
	{
		id: "delete" as const,
		label: "Delete Domain",
		icon: "trash" as const,
		isDanger: true,
	},
];

export function DomainDropdown({
	domainId,
	domainName,
	onViewDetails,
	onDelete,
	onOpenChange,
}: {
	domainId: string;
	domainName: string;
	onViewDetails: (name: string) => void;
	onDelete: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [forwardOpen, setForwardOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const { handleVerifyDNS } = useDomainActions(domainId);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setHoverIdx(undefined);
		onOpenChange?.(next);
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="aspect-square h-7 w-7 rounded-lg p-0"
						aria-label={`Actions for ${domainName}`}
					>
						<Icon
							name="more-horizontal"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className="w-48 gap-0 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
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
										onDelete(domainId);
									} else if (item.id === "view") {
										onViewDetails(domainName);
									} else if (item.id === "copy_name") {
										void navigator.clipboard.writeText(domainName);
										toast.success("Domain name copied to clipboard");
									} else if (item.id === "copy_id") {
										void navigator.clipboard.writeText(domainId);
										toast.success("Domain ID copied to clipboard");
									} else if (item.id === "reverify") {
										void handleVerifyDNS();
									} else if (item.id === "forward") {
										setForwardOpen(true);
									}
									handleOpenChange(false);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs",
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
				</Dropdown.Content>
			</Dropdown.Root>
			{domainId && (
				<ForwardDNSRecordsModal
					domainId={domainId}
					open={forwardOpen}
					onOpenChange={setForwardOpen}
				/>
			)}
		</div>
	);
}
