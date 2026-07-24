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
		<div className="w-full max-w-xl mx-auto space-y-6">
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:p-8 shadow-sm shadow-black/[0.03]">
				<div className="flex items-center justify-between pb-4 mb-6 border-b border-stroke-soft-200/60">
					<div>
						<h2 className="text-xl font-semibold text-text-strong-950 tracking-tight">
							Sync Contacts via REST API
						</h2>
						<p className="text-xs text-text-sub-600 mt-1">
							Stream new signups and user updates directly from your backend application.
						</p>
					</div>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onBack}
					>
						<Button.Icon>
							<Icon name="chevron-left" className="h-3.5 w-3.5" />
						</Button.Icon>
						Change Method
					</Button.Root>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-1">
							<button
								type="button"
								onClick={() => setSelectedTab("curl")}
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
							className="inline-flex items-center gap-1.5 text-xs text-text-sub-600 hover:text-text-strong-950 font-medium transition-colors"
						>
							<Icon name={copied ? "check-circle" : "copy"} className="h-3.5 w-3.5" />
							{copied ? "Copied" : "Copy Code"}
						</button>
					</div>

					<div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-100 overflow-x-auto">
						<pre className="whitespace-pre">{currentSnippet}</pre>
					</div>

					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 p-4 text-xs text-text-sub-600 space-y-1">
						<p className="font-medium text-text-strong-950">API Keys Required</p>
						<p className="leading-relaxed">
							Be sure to pass a valid secret API key in the authorization header. You can generate or view your workspace API keys in API Keys settings.
						</p>
					</div>

					<div className="pt-4 flex items-center justify-between border-t border-stroke-soft-200/60">
						<a
							href="https://reloop.sh/docs/api-reference/contacts"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 text-xs font-medium text-text-strong-950 hover:underline"
						>
							Read Full API Documentation
							<Icon name="chevron-right" className="h-3 w-3" />
						</a>

						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => void navigate({ to: "/contacts" })}
						>
							Done
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);
}
