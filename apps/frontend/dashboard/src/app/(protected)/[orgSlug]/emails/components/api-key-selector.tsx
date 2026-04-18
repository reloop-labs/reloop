"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";
import useSWR from "swr";

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
	const { activeOrganization } = useUserOrganization();
	const [isOpen, setIsOpen] = useState(false);

	const { data, isLoading } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/" : null,
	);

	const apiKeys = data?.apiKeys || [];
	const selectedKey = apiKeys.find((k: ApiKeyData) => k.id === value);

	const handleSelect = (keyId: string) => {
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
				<div className="flex items-center justify-between border-stroke-soft-200 border-b px-1 pb-2">
					<span className="font-medium text-text-sub-600 text-xs">
						Filter by API key
					</span>
					{value && (
						<button
							type="button"
							onClick={() => {
								onChange("");
								setIsOpen(false);
							}}
							className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50"
						>
							Reset
						</button>
					)}
				</div>

				<div className="mt-2 max-h-60 overflow-y-auto">
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
						<div className="space-y-0.5">
							{apiKeys.map((key) => (
								<button
									key={key.id}
									type="button"
									onClick={() => handleSelect(key.id)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
										key.id === value
											? "bg-neutral-alpha-10 font-medium text-text-strong-950"
											: "text-text-strong-950 hover:bg-neutral-alpha-5",
									)}
								>
									<div className="flex items-center gap-2 truncate">
										<Icon
											name="key"
											className={cn(
												"h-3.5 w-3.5 shrink-0",
												key.id === value
													? "text-text-strong-950"
													: "text-text-sub-600",
											)}
										/>
										<span className="truncate">
											{key.name || key.prefix || "Unnamed Key"}
										</span>
									</div>
									{key.id === value && (
										<Icon
											name="check"
											className="h-3.5 w-3.5 text-text-strong-950"
										/>
									)}
								</button>
							))}
						</div>
					)}
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
