"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight, Copy, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	lastRequest: string | null;
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
	total: number;
}

export function ApiKeyCard() {
	const { activeOrganization } = useUserOrganization();
	const [showApiKey, setShowApiKey] = useState(false);

	const { data: apiKeysData } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/?limit=10&page=1" : null,
	);

	const primaryApiKey = apiKeysData?.apiKeys?.[0];
	const displayPrefix = primaryApiKey?.start || "rl_live";
	const maskedKey = `${displayPrefix}_••••••••••••••••••••••••••••9d06`;
	const unmaskedKey = primaryApiKey
		? `${displayPrefix}_7f8e0d9a8b7c6d5e4f3g2h1i0j_9d06`
		: `${displayPrefix}_5a7c2b9f8d1e3d4e6a8b7c9f8e0d_9d06`;

	const handleCopy = () => {
		const text = primaryApiKey
			? unmaskedKey
			: "rl_live_mock_secret_key_reloop_01";
		navigator.clipboard.writeText(text);
		toast.success("API Key copied to clipboard");
	};

	return (
		<div className="group flex w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="/api-keys"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="key-new" className="h-4 w-4 shrink-0" />
					<span>API Key</span>
				</Link>
				<Link
					href="/api-keys"
					className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>

			<div className="-mt-1.5 rounded-xl border border-stroke-soft-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				<p className="text-text-sub-600 text-xs dark:text-white/50">
					Start sending emails programmatically right away.
				</p>

				<div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.02]">
					<code className="min-w-0 flex-1 select-all truncate font-mono text-text-strong-950 text-xs dark:text-white/80">
						{showApiKey ? unmaskedKey : maskedKey}
					</code>
					<div className="flex shrink-0 items-center gap-1">
						<button
							type="button"
							onClick={() => setShowApiKey(!showApiKey)}
							title={showApiKey ? "Hide Key" : "Show Key"}
							className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60 dark:hover:text-white"
						>
							{showApiKey ? (
								<EyeOff className="h-3.5 w-3.5" />
							) : (
								<Eye className="h-3.5 w-3.5" />
							)}
						</button>
						<button
							type="button"
							onClick={handleCopy}
							title="Copy Key"
							className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60 dark:hover:text-white"
						>
							<Copy className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
