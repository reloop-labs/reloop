"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import {
	CheckCircle2,
	Copy,
	Key,
	Loader2,
	Plus,
	ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

export const GenerateApiKeyStep = () => {
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);

	const generateKey = () => {
		setLoading(true);
		setTimeout(() => {
			const key =
				"mi_live_" +
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
			setApiKey(key);
			setLoading(false);
		}, 1200);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			{!apiKey ? (
				<div className="flex w-full flex-col items-center justify-center p-4">
					{/* Illustration Area */}
					<div className="relative mb-8 flex h-64 w-64 items-center justify-center">
						{/* The Dashed Orbit Ring */}
						<div className="absolute inset-0 rounded-full border border-gray-200 border-dashed opacity-75" />

						{/* Inner Glow/Background (Optional) */}
						<div className="absolute h-32 w-32 rounded-full bg-gray-50 opacity-60 blur-2xl" />

						{/* Center Element: The Main Key Icon */}
						<div className="relative z-10 flex h-20 w-24 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
							<div className="mb-2 h-2 w-full rounded-t-xl bg-gray-100 opacity-50" />{" "}
							{/* Top decoration */}
							<Key className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
							<div className="mt-2 h-1.5 w-12 rounded-full bg-gray-100" />{" "}
							{/* Skeleton text line */}
						</div>

						{/* Satellite Icon 1 (Top Left) - Shield */}
						<div className="absolute top-8 left-8 flex h-10 w-10 animate-bounce-slow items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
							<ShieldCheck className="h-4 w-4 text-gray-300" />
						</div>

						{/* Satellite Icon 2 (Bottom Right) - Lock */}
						<div className="absolute right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
							<ShieldCheck className="h-5 w-5 text-gray-300" />
						</div>
					</div>
					<Button.Root
						variant="neutral"
						mode="filled"
						onClick={generateKey}
						disabled={loading}
						className="w-full"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
						{loading ? "Generating..." : "Generate Secret Key"}
					</Button.Root>
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex gap-4 rounded-xl border border-warning-lighter bg-warning-lighter p-5">
						<div className="mt-1 text-warning-base">
							<ShieldCheck size={24} />
						</div>
						<div>
							<h4 className="font-semibold text-text-strong-950">
								Keep this key secret
							</h4>
							<p className="mt-1 text-sm text-text-sub-600 leading-relaxed">
								We only show this key once. If you lose it, you will need to
								generate a new one and update your applications.
							</p>
						</div>
					</div>

					<div>
						<label
							htmlFor="api-key"
							className="mb-2 block font-semibold text-sm text-text-strong-950"
						>
							Your API Key
						</label>
						<div className="group relative">
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="api-key"
										type="text"
										readOnly
										value={apiKey}
										className="pr-14 font-mono"
									/>
								</Input.Wrapper>
							</Input.Root>
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="xsmall"
								onClick={copyToClipboard}
								className="-translate-y-1/2 absolute top-1/2 right-2"
								title="Copy to clipboard"
							>
								{copied ? (
									<CheckCircle2 size={18} className="text-success-base" />
								) : (
									<Copy size={18} />
								)}
							</Button.Root>
						</div>
					</div>

					<div className="pt-4">
						<Button.Root
							variant="neutral"
							mode="filled"
							className="w-full"
							onClick={() => router.push("/")}
						>
							Go to Dashboard
						</Button.Root>
					</div>
				</div>
			)}
		</div>
	);
};
