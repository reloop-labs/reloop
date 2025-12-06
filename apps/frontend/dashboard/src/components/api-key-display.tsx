"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import { logger } from "better-auth";
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
		activeOrganization?.id ? "/api/api-key/v1" : null,
	);

	console.log(data?.apiKeys?.[0], "API key data here");

	const apiKey = data?.apiKeys?.[0];
	// Build masked key: prefix + asterisks + last 4 chars of start
	const prefix = apiKey?.prefix || "";
	const start = apiKey?.start || "";
	const suffix = start.slice(-4);
	const asteriskCount = 24; // Fixed number of asterisks for consistent display
	const maskedKey = prefix && start ? `${prefix}${"*".repeat(asteriskCount)}${suffix}` : "";
	const fullKey = start; // The actual key to copy/reveal

	const handleCopy = async () => {
		if (fullKey) {
			try {
				await navigator.clipboard.writeText(fullKey);
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
					Use this key to authenticate your API requests
				</p>
			</div>

			{isLoading ? (
				<div className="flex h-12 items-center justify-center rounded-lg bg-bg-weak-50">
					<div className="text-sm text-text-sub-600">Loading API key...</div>
				</div>
			) : maskedKey ? (
				<div className="flex items-center gap-2 rounded-xl bg-bg-weak-50 p-4">
					<code className="flex-1 font-mono text-sm text-text-sub-600">
						{isVisible ? fullKey : maskedKey}
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

