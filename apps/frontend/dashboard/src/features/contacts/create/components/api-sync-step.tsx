import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
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
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				{/* Top Padded Content Area */}
				<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
					{/* Header */}
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
							Sync Contacts via REST API
						</h2>
						<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
							Stream new signups and user updates directly from your backend
							application.
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-1">
								<button
									type="button"
									onClick={() => setSelectedTab("curl")}
									className={`cursor-pointer rounded-md px-3 py-1 font-medium text-xs transition-colors ${
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
									className={`cursor-pointer rounded-md px-3 py-1 font-medium text-xs transition-colors ${
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
								className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
							>
								<Icon
									name={copied ? "check-circle" : "copy"}
									className="h-3.5 w-3.5"
								/>
								{copied ? "Copied" : "Copy Code"}
							</button>
						</div>

						<div className="relative overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-neutral-100 text-xs">
							<pre className="whitespace-pre">{currentSnippet}</pre>
						</div>

						<div className="space-y-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-text-sub-600 text-xs">
							<p className="font-medium text-text-strong-950">
								API Keys Required
							</p>
							<p className="leading-relaxed">
								Be sure to pass a valid secret API key in the authorization
								header. You can generate or view your workspace API keys in API
								Keys settings.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom Footer / Action Bar */}
				<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={onBack}
					>
						Back
					</Button.Root>

					<div className="flex items-center gap-3">
						<a
							href="https://reloop.sh/docs/api-reference/contacts"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 font-medium text-text-strong-950 text-xs hover:underline"
						>
							API Documentation
							<Icon name="chevron-right" className="h-3 w-3" />
						</a>

						<FancyButton.Root
							type="button"
							variant="primary"
							size="small"
							onClick={() => void navigate({ to: "/contacts" })}
						>
							Done
						</FancyButton.Root>
					</div>
				</div>
			</div>
		</div>
	);
}

