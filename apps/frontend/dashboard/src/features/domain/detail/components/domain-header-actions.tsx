import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Domain } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { ForwardDNSRecordsModal } from "../../add/setup/components/forward-dns-records-modal";
import {
	isForwardRecordsSequence,
	noteForwardFKey,
} from "../../add/setup/components/forward-records-shortcut";
import { useDomainActions } from "../hooks/use-domain-actions";

interface DomainHeaderActionsProps {
	domain?: Domain;
	domainRecordId: string;
	onVerifyDNS?: () => void;
}

type MenuItem = {
	id: "copy_name" | "copy_id" | "reverify" | "forward" | "delete";
	label: string;
	icon: string;
	/** Single key, or space-separated sequence shown as multiple keycaps. */
	shortcut: string;
	isDanger?: boolean;
};

export const DomainHeaderActions = ({
	domain,
	domainRecordId,
	onVerifyDNS,
}: DomainHeaderActionsProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [forwardOpen, setForwardOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const openedBySequenceRef = useRef(false);
	const { handleVerifyDNS } = useDomainActions(domainRecordId);

	const headerMenuItems = useMemo<MenuItem[]>(
		() => [
			{
				id: "copy_name",
				label: "Copy Domain Name",
				icon: "copy",
				shortcut: "C",
			},
			{
				id: "copy_id",
				label: "Copy Domain ID",
				icon: "copy",
				shortcut: "I",
			},
			{
				id: "reverify",
				label: "Re-verify DNS",
				icon: "refresh-cw",
				shortcut: "V",
			},
			{
				id: "forward",
				label: "Forward Records",
				icon: "mail-single",
				shortcut: "F R",
			},
			{
				id: "delete",
				label: "Delete Domain",
				icon: "trash",
				shortcut: "X",
				isDanger: true,
			},
		],
		[],
	);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const runAction = useCallback(
		(id: MenuItem["id"]) => {
			if (id === "copy_name") {
				const textToCopy = domain?.domain || domainRecordId;
				void navigator.clipboard.writeText(textToCopy);
				toast.success("Domain name copied to clipboard");
				return;
			}
			if (id === "copy_id") {
				void navigator.clipboard.writeText(domainRecordId);
				toast.success("Domain ID copied to clipboard");
				return;
			}
			if (id === "reverify") {
				if (onVerifyDNS) onVerifyDNS();
				else void handleVerifyDNS();
				return;
			}
			if (id === "forward") {
				setForwardOpen(true);
				return;
			}
			if (id === "delete") {
				void setDeleteId(domainRecordId);
			}
		},
		[domain?.domain, domainRecordId, handleVerifyDNS, onVerifyDNS, setDeleteId],
	);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			runAction("copy_name");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[runAction],
	);

	useHotkeys(
		"i",
		(e) => {
			e.preventDefault();
			runAction("copy_id");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[runAction],
	);

	useHotkeys(
		"v",
		(e) => {
			e.preventDefault();
			runAction("reverify");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[runAction],
	);

	// F → R opens Forward Records (same sequence as the Forward button).
	useHotkeys(
		"f",
		() => {
			noteForwardFKey();
			openedBySequenceRef.current = false;
		},
		{ enableOnFormTags: false, enabled: !forwardOpen },
		[forwardOpen],
	);

	useHotkeys(
		"r",
		(e) => {
			if (!isForwardRecordsSequence() || openedBySequenceRef.current) return;
			e.preventDefault();
			openedBySequenceRef.current = true;
			runAction("forward");
		},
		{ enableOnFormTags: false, preventDefault: false, enabled: !forwardOpen },
		[forwardOpen, runAction],
	);

	useHotkeys(
		"x",
		(e) => {
			e.preventDefault();
			runAction("delete");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[runAction],
	);

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
					className="w-56 rounded-xl p-1.5"
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
								onClick={() => runAction(item.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-medium text-[13px] transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<div className="flex min-w-0 items-center gap-2 truncate">
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5 shrink-0",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
									<span className="truncate">{item.label}</span>
								</div>
								<span className="inline-flex shrink-0 items-center gap-0.5">
									{item.shortcut.split(" ").map((key) => (
										<ActionKbd
											key={key}
											className="w-auto min-w-4 px-1"
										>
											{key}
										</ActionKbd>
									))}
								</span>
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
