"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
}

export const ApiKeyDisplay = () => {
	const { activeOrganization } = useUserOrganization();
	const [isVisible, setIsVisible] = useState(false);

	const { data, isLoading } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/?limit=1" : null,
	);

	const apiKey = data?.apiKeys?.[0];
	const displayKey = apiKey?.start || apiKey?.prefix || "";
	const maskedKey = displayKey
		? `${displayKey.substring(0, 4)}${"*".repeat(Math.max(0, displayKey.length - 8))}${displayKey.substring(displayKey.length - 4)}`
		: "";

	const handleCopy = async () => {
		if (displayKey) {
			try {
				await navigator.clipboard.writeText(displayKey);
				toast.success("API key copied to clipboard");
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	return (
		<div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6">
			<div className="mb-4">
				<h3 className="font-semibold text-lg text-text-strong-950">
					API Key
				</h3>
				<p className="mt-1 text-sm text-text-sub-600">
					Start scraping right away
				</p>
			</div>

			{isLoading ? (
				<div className="flex h-12 items-center justify-center rounded-lg bg-bg-weak-50">
					<div className="text-sm text-text-sub-600">Loading API key...</div>
				</div>
			) : displayKey ? (
				<div className="flex items-center gap-2 rounded-lg bg-warning-light p-3">
					<code className="flex-1 font-mono text-sm text-text-strong-950">
						{isVisible ? displayKey : maskedKey}
					</code>
					<button
						onClick={() => setIsVisible(!isVisible)}
						className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-bg-white-0"
						aria-label={isVisible ? "Hide API key" : "Show API key"}
					>
						<Icon
							name={isVisible ? "eye-slash-outline" : "eye-outline"}
							className="h-4 w-4 text-text-sub-600"
						/>
					</button>
					<button
						onClick={handleCopy}
						className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-bg-white-0"
						aria-label="Copy API key"
					>
						<Icon name="copy" className="h-4 w-4 text-text-sub-600" />
					</button>
				</div>
			) : (
				<div className="flex h-12 items-center justify-center rounded-lg bg-bg-weak-50">
					<p className="text-sm text-text-sub-600">No API key found</p>
				</div>
			)}
		</div>
	);
};

