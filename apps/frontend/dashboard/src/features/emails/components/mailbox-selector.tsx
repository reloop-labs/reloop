import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useMailboxesQuery } from "#/features/emails/hooks/use-emails-query";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

interface MailboxSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const MailboxSelector = ({ value, onChange }: MailboxSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const { data: mailboxesData } = useMailboxesQuery();

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hasActiveFilter = !!value;

	const handleToggle = (mailboxId: string | null) => {
		onChange(mailboxId || "");
		setIsOpen(false);
	};

	const selectedMailbox = mailboxesData?.find((m) => m.id === value);
	const displayLabel = selectedMailbox
		? selectedMailbox.displayName || selectedMailbox.email
		: "Mailbox";

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap rounded-xl",
						hasActiveFilter &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<Button.Icon>
						<Icon name="inbox" className="h-3.5 w-3.5" />
					</Button.Icon>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-64 p-2">
				<div className="relative max-h-80 overflow-y-auto">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => handleToggle(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							value === "" && "bg-neutral-alpha-10",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<span className={cn(value === "" && "font-medium")}>
							All Mailboxes
						</span>
						{value === "" && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>

					{mailboxesData?.map((mailbox, idx) => {
						const isChecked = value === mailbox.id;
						const index = idx + 1;
						return (
							<button
								key={mailbox.id}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(index)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(mailbox.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
									!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex min-w-0 flex-col items-start pr-2">
									<span className={cn("w-full truncate text-left font-medium")}>
										{mailbox.displayName || mailbox.email.split("@")[0]}
									</span>
									<span className="w-full truncate text-left text-[10px] text-text-sub-600">
										{mailbox.email}
									</span>
								</div>
								{isChecked && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 flex-shrink-0 text-text-strong-950"
									/>
								)}
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
