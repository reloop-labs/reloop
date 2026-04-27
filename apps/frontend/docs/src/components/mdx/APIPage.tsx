"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { CodeGroup } from "./mintlify-client";

interface APIPageProps {
	document: string;
	operations: {
		path: string;
		method: string;
	}[];
}

export function APIPage({ document, operations }: APIPageProps) {
	const operation = operations?.[0];
	if (!operation) return null;

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(`https://api.reloop.sh${operation.path}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const methodColors = {
		get: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
		post: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
		put: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
		delete: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
		patch:
			"bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
	};

	const method = operation.method.toLowerCase() as keyof typeof methodColors;

	return (
		<div className="not-prose my-10 space-y-8">
			{/* Header / Endpoint Area */}
			<div className="flex flex-col gap-4 rounded-2xl border border-fd-border bg-fd-muted/5 p-6 transition-all hover:bg-fd-muted/10">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"rounded-lg border px-2.5 py-1 font-bold text-[11px] uppercase tracking-wider",
								methodColors[method] || methodColors.get,
							)}
						>
							{operation.method}
						</div>
						<div className="font-mono text-[13px] text-fd-foreground/80 tracking-tight">
							{operation.path}
						</div>
					</div>
					<button
						type="button"
						onClick={handleCopy}
						className="flex h-8 w-8 items-center justify-center rounded-lg border border-fd-border bg-fd-background text-fd-muted-foreground transition-all hover:text-fd-foreground active:scale-95"
					>
						{copied ? (
							<Icon name="check" className="h-3.5 w-3.5" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
					</button>
				</div>

				<div className="h-px w-full bg-fd-border/50" />

				<div className="flex flex-wrap items-center gap-6 text-[13px]">
					<div className="flex items-center gap-2 text-fd-muted-foreground">
						<Icon name="lock" className="h-3.5 w-3.5" />
						<span>API Key Required</span>
					</div>
					<div className="flex items-center gap-2 text-fd-muted-foreground">
						<Terminal className="h-3.5 w-3.5" />
						<span>
							Base URL:{" "}
							<code className="text-fd-foreground">https://api.reloop.sh</code>
						</span>
					</div>
				</div>
			</div>

			{/* Parameters Section - Placeholder for now, can be expanded to parse OpenAPI */}
			<div className="space-y-4">
				<h3 className="font-semibold text-fd-foreground text-lg tracking-tight">
					Parameters
				</h3>
				<div className="overflow-hidden rounded-xl border border-fd-border bg-fd-background p-1">
					<table className="w-full text-left text-[13px]">
						<thead className="bg-fd-muted/30 text-fd-muted-foreground">
							<tr>
								<th className="px-4 py-2 font-medium">Name</th>
								<th className="px-4 py-2 font-medium">Type</th>
								<th className="px-4 py-2 font-medium">Description</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-fd-border">
							<tr>
								<td className="px-4 py-3 font-mono font-semibold text-fd-foreground">
									api_key_id
								</td>
								<td className="px-4 py-3 text-fd-muted-foreground">string</td>
								<td className="px-4 py-3 text-fd-muted-foreground">
									The unique identifier of the API key to perform action on.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Code Examples Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-fd-foreground text-lg tracking-tight">
					Code Example
				</h3>
				<CodeGroup>
					<div title="cURL">
						<pre className="bg-fd-muted/10 p-4 rounded-lg overflow-x-auto text-[13px] font-mono">
							<code>{`curl -X ${operation.method.toUpperCase()} "https://api.reloop.sh${operation.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
						</pre>
					</div>
					<div title="Node.js">
						<pre className="bg-fd-muted/10 p-4 rounded-lg overflow-x-auto text-[13px] font-mono">
							<code>{`import { Reloop } from '@reloop/sdk';\n\nconst reloop = new Reloop('YOUR_API_KEY');\nconst response = await reloop.apiKeys.${operation.method === "post" ? "create" : "get"}();`}</code>
						</pre>
					</div>
				</CodeGroup>
			</div>
			{/* Footer / Meta Section */}
			<div className="flex items-center gap-2 pt-6 border-t border-fd-border/50 text-xs text-fd-muted-foreground/60">
				<Icon name="file-text" className="h-3 w-3" />
				<span>Source: </span>
				<a
					href={document}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-fd-foreground underline decoration-fd-border underline-offset-2 transition-colors"
				>
					Raw OpenAPI Spec
				</a>
			</div>
		</div>
	);
}
