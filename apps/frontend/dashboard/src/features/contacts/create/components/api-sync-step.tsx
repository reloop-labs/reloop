import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface ApiSyncStepProps {
	onBack: () => void;
}

export function ApiSyncStep({ onBack }: ApiSyncStepProps) {
	const navigate = useNavigate();
	const [selectedTab, setSelectedTab] = useState<"curl" | "node">("curl");
	const [copied, setCopied] = useState(false);

	const curlSnippet = `curl -X POST https://api.reloop.sh/v1/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "properties": {
      "plan": "pro"
    }
  }'`;

	const nodeSnippet = `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop({ apiKey: process.env.RELOOP_API_KEY });

await reloop.contacts.create({
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  properties: {
    plan: 'pro',
  },
});`;

	const currentSnippet = selectedTab === "curl" ? curlSnippet : nodeSnippet;

	const handleCopy = () => {
		void navigator.clipboard.writeText(currentSnippet);
		setCopied(true);
		toast.success("Snippet copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="w-full space-y-6 font-sans">
			<div className="rounded-3xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
				<div className="p-6 sm:p-7 space-y-6">
					<div>
						<h2 className="text-base font-semibold text-text-strong-950 tracking-tight">
							Sync Contacts via REST API
						</h2>
						<p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
							Stream new signups and user updates directly from your backend application.
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-1">
								<button
									type="button"
									onClick={() => setSelectedTab("curl")}
									className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
										selectedTab === "curl"
											? "bg-bg-white-0 text-text-strong-950 shadow-xs"
											: "text-text-sub-600 hover:text-text-strong-950"
									}`}
								>
									cURL
								</button>
								<button
									type="button"
									onClick={() => setSelectedTab("node")}
									className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
										selectedTab === "node"
											? "bg-bg-white-0 text-text-strong-950 shadow-xs"
											: "text-text-sub-600 hover:text-text-strong-950"
									}`}
								>
									Node.js SDK
								</button>
							</div>

							<button
								type="button"
								onClick={handleCopy}
								className="inline-flex items-center gap-1.5 text-xs text-text-sub-600 hover:text-text-strong-950 font-medium transition-colors cursor-pointer"
							>
								<Icon name={copied ? "check-circle" : "copy"} className="h-3.5 w-3.5" />
								{copied ? "Copied" : "Copy Code"}
							</button>
						</div>

						<div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-100 overflow-x-auto">
							<pre className="whitespace-pre">{currentSnippet}</pre>
						</div>

						<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-xs text-text-sub-600 space-y-1">
							<p className="font-medium text-text-strong-950">API Keys Required</p>
							<p className="leading-relaxed">
								Be sure to pass a valid secret API key in the authorization header. You can generate or view your workspace API keys in API Keys settings.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom Footer / Action Bar */}
				<div className="border-t border-stroke-soft-200 bg-[#f9fafb] px-6 py-4 flex items-center justify-between dark:bg-bg-weak-50/40">
					<button
						type="button"
						onClick={onBack}
						className="text-sm font-medium text-text-sub-600 hover:text-text-strong-950 transition-colors cursor-pointer"
					>
						Back
					</button>

					<div className="flex items-center gap-4">
						<a
							href="https://reloop.sh/docs/api-reference/contacts"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 text-xs font-medium text-text-strong-950 hover:underline"
						>
							API Documentation
							<Icon name="chevron-right" className="h-3 w-3" />
						</a>

						<button
							type="button"
							onClick={() => void navigate({ to: "/contacts" })}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium px-4 py-2 text-sm shadow-xs transition-all cursor-pointer"
						>
							Done
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
