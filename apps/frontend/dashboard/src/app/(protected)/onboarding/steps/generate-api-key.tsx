"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import {
	CheckCircle2,
	Copy,
	Key,
	Loader2,
	Plus,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";

interface GenerateApiKeyStepProps {
	data: {
		apiKey: string;
	};
	updateData: (newData: Partial<GenerateApiKeyStepProps["data"]>) => void;
}

export const GenerateApiKeyStep = ({
	data,
	updateData,
}: GenerateApiKeyStepProps) => {
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);

	const generateKey = () => {
		setLoading(true);
		setTimeout(() => {
			const key =
				"mi_live_" +
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
			updateData({ apiKey: key });
			setLoading(false);
		}, 1200);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(data.apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			{!data.apiKey ? (
				<div className="flex h-[600px] w-full flex-col items-center justify-center bg-white p-4">
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

					{/* Text Content */}
					<div className="max-w-md space-y-2 text-center">
						<h3 className="font-semibold text-gray-900 text-xl">
							No API keys generated
						</h3>
						<p className="text-gray-500 text-sm">
							Create a secret key to authenticate your application and start
							interacting with the API.
						</p>
					</div>

					{/* Action Button */}
					<div className="mt-8">
						<button
							type="button"
							onClick={generateKey}
							className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-sm text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-95"
						>
							<Plus className="h-4 w-4" />
							Generate Secret Key
						</button>
					</div>
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
										value={data.apiKey}
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
				</div>
			)}
		</div>
	);
};
