import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { queryKeys } from "#/lib/query-keys";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface ApiKeyData {
	id: string;
	name: string | null;
	prefix: string | null;
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
}

interface ApiKeySelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const ApiKeySelector = ({ value, onChange }: ApiKeySelectorProps) => {
	const { activeOrganization } = useActiveOrganization();
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const { data, isPending: isLoading } = useQuery({
		queryKey: [...queryKeys.apiKeys.all, "selector"],
		queryFn: async () => {
			const res = await fetch("/api/api-key/v1/", { credentials: "include" });
			if (!res.ok) throw new Error("Failed to load API keys");
			return res.json() as Promise<ApiKeyListResponse>;
		},
		enabled: !!activeOrganization?.id,
	});

	const apiKeys = data?.apiKeys || [];
	const selectedKey = apiKeys.find((k) => k.id === value);
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleSelect = (keyId: string | null) => {
		if (keyId === null) {
			onChange("");
			setIsOpen(false);
			return;
		}
		onChange(keyId === value ? "" : keyId);
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
						<Icon name="key" className="h-3.5 w-3.5" />
					</Button.Icon>
					{selectedKey
						? selectedKey.name || selectedKey.prefix || "API Key"
						: "API Key"}
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
						onClick={() => handleSelect(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							value === "" && "bg-neutral-alpha-10",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-2">
							<span className={cn(value === "" && "font-medium")}>
								All API Keys
							</span>
						</div>
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
					) : apiKeys.length === 0 ? (
						<div className="p-4 text-center text-text-sub-600 text-xs">
							No API keys found
						</div>
					) : (
						<div>
							{apiKeys.map((key, idx) => {
								const isSelected = key.id === value;
								const index = idx + 1;
								return (
									<button
										key={key.id}
										ref={(el) => {
											if (el) buttonRefs.current[index] = el;
										}}
										type="button"
										onPointerEnter={() => setHoverIdx(index)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onClick={() => handleSelect(key.id)}
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
											<span className="truncate">
												{key.name || key.prefix || "Unnamed Key"}
											</span>
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
