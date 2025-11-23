"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import {
	CheckCircle2,
	Copy,
	Key,
	Loader2,
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
				<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-white-0 text-primary-base shadow-sm">
						<Key size={32} />
					</div>
					<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
						Generate Secret Key
					</h3>
					<p className="mx-auto mb-6 max-w-sm text-text-sub-600">
						You need an API key to authenticate your requests. This key grants
						full access to your account.
					</p>
					<Button.Root
						variant="neutral"
						mode="filled"
						onClick={generateKey}
						disabled={loading}
					>
						{loading ? (
							<Loader2 className="mr-2 animate-spin" size={18} />
						) : (
							<RefreshCw className="mr-2" size={18} />
						)}
						Generate API Key
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
