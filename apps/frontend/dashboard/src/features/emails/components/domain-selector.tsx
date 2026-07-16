import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type { DomainListResponse } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { queryKeys } from "#/lib/query-keys";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface DomainSelectorProps {
	value: string;
	onChange: (value: string) => void;
	align?: "start" | "end";
}

export const DomainSelector = ({
	value,
	onChange,
	align = "start",
}: DomainSelectorProps) => {
	const { activeOrganization } = useActiveOrganization();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const { data, isPending: isLoading } = useQuery({
		queryKey: [...queryKeys.domain.list(), "selector", activeOrganization?.id],
		queryFn: async () => {
			const res = await fetch(
				`/api/domain/v1/list?organizationId=${activeOrganization?.id}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load domains");
			return res.json() as Promise<DomainListResponse>;
		},
		enabled: !!activeOrganization?.id,
	});

	const domains = data?.domains || [];
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleSelect = (domainName: string | null) => {
		if (domainName === null) {
			onChange("");
			setIsOpen(false);
			return;
		}
		onChange(domainName === value ? "" : domainName);
		setIsOpen(false);
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap rounded-xl",
						value &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<Button.Icon>
						<Icon name="globe" className="h-3.5 w-3.5" />
					</Button.Icon>
					{value || "Domain"}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align={align} className="w-64 p-2">
				<div className="relative max-h-80 overflow-y-auto">
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => handleSelect(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							value === "" && "bg-neutral-alpha-10",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className={cn(value === "" && "font-medium")}>All Domains</div>
						{value === "" && (
							<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
						)}
					</button>

					{isLoading ? (
						<div className="space-y-1 p-1">
							<Skeleton className="h-8 w-full rounded-lg" />
							<Skeleton className="h-8 w-full rounded-lg" />
							<Skeleton className="h-8 w-full rounded-lg" />
						</div>
					) : domains.length === 0 ? (
						<div className="p-4 text-center text-text-sub-600 text-xs">
							No domains found
						</div>
					) : (
						<div>
							{domains.map((domain, idx) => {
								const isSelected = domain.domain === value;
								const index = idx + 1;
								return (
									<button
										key={domain.id}
										ref={(el) => {
											if (el) buttonRefs.current[index] = el;
										}}
										type="button"
										onPointerEnter={() => setHoverIdx(index)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onClick={() => handleSelect(domain.domain)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
											"text-text-strong-950",
											isSelected && "bg-neutral-alpha-10",
											!currentRect &&
												hoverIdx === index &&
												"bg-neutral-alpha-10",
										)}
									>
										<div className="flex items-center gap-2 truncate">
											<span className="truncate">{domain.domain}</span>
										</div>
										{isSelected && (
											<Icon
												name="check"
												className="h-3.5 w-3.5 text-text-strong-950"
											/>
										)}
									</button>
								);
							})}
						</div>
					)}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
