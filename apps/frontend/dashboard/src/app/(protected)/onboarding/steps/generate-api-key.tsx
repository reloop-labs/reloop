"use client";

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
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
						<Key size={32} />
					</div>
					<h3 className="mb-2 font-semibold text-lg text-slate-900">
						Generate Secret Key
					</h3>
					<p className="mx-auto mb-6 max-w-sm text-slate-500">
						You need an API key to authenticate your requests. This key grants
						full access to your account.
					</p>
					<button
						type="button"
						onClick={generateKey}
						disabled={loading}
						className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
					>
						{loading ? (
							<Loader2 className="mr-2 animate-spin" size={18} />
						) : (
							<RefreshCw className="mr-2" size={18} />
						)}
						Generate API Key
					</button>
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex gap-4 rounded-xl border border-amber-100 bg-amber-50 p-5">
						<div className="mt-1 text-amber-600">
							<ShieldCheck size={24} />
						</div>
						<div>
							<h4 className="font-semibold text-amber-900">
								Keep this key secret
							</h4>
							<p className="mt-1 text-amber-700 text-sm leading-relaxed">
								We only show this key once. If you lose it, you will need to
								generate a new one and update your applications.
							</p>
						</div>
					</div>

					<div>
						<label
							htmlFor="api-key"
							className="mb-2 block font-semibold text-slate-700 text-sm"
						>
							Your API Key
						</label>
						<div className="group relative">
							<input
								id="api-key"
								type="text"
								readOnly
								value={data.apiKey}
								className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-14 font-mono text-slate-600 text-sm transition-colors focus:border-blue-500 focus:outline-none"
							/>
							<button
								type="button"
								onClick={copyToClipboard}
								className="-translate-y-1/2 absolute top-1/2 right-2 transform rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
								title="Copy to clipboard"
							>
								{copied ? (
									<CheckCircle2 size={18} className="text-green-500" />
								) : (
									<Copy size={18} />
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
