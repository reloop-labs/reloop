"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { CodeGroup } from "./mintlify-client";

interface ParameterInfo {
	name: string;
	type: string;
	required: boolean;
	description: string;
	location: string; // "path", "query", "header", "body"
}

interface APIPageProps {
	document: string;
	operations: {
		path: string;
		method: string;
	}[];
	/** Pre-resolved parameters from build-time OpenAPI fetch */
	parameters?: ParameterInfo[];
	/** Pre-resolved request body schema */
	requestBody?: Record<string, any>;
	/** Pre-resolved response schemas */
	responses?: Record<string, any>;
}

const methodColors = {
	get: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
	post: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
	put: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
	delete:
		"bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
	patch:
		"bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

function generateCurl(method: string, path: string, hasBody: boolean): string {
	const url = `https://api.reloop.sh${path}`;
	let cmd = `curl -X ${method.toUpperCase()} "${url}" \\
  -H "x-api-key: rl_YOUR_API_KEY"`;
	if (hasBody) {
		cmd += ` \\
  -H "Content-Type: application/json" \\
  -d '{}'`;
	}
	return cmd;
}

function generateNodeJS(method: string, path: string, hasBody: boolean): string {
	const url = `https://api.reloop.sh${path}`;
	let code = `const response = await fetch("${url}", {
  method: "${method.toUpperCase()}",
  headers: {
    "x-api-key": "rl_YOUR_API_KEY"${hasBody ? ',\n    "Content-Type": "application/json"' : ""}
  }${hasBody ? ",\n  body: JSON.stringify({})" : ""}
});

const data = await response.json();`;
	return code;
}

function generatePython(method: string, path: string, hasBody: boolean): string {
	const url = `https://api.reloop.sh${path}`;
	let code = `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
        "x-api-key": "rl_YOUR_API_KEY",
    }${hasBody ? ',\n    json={}' : ""}
)

data = response.json()`;
	return code;
}

function ParametersTable({ parameters }: { parameters: ParameterInfo[] }) {
	if (!parameters.length) return null;

	return (
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
							<th className="px-4 py-2 font-medium">In</th>
							<th className="px-4 py-2 font-medium">Description</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-fd-border">
						{parameters.map((param) => (
							<tr key={`${param.location}-${param.name}`}>
								<td className="px-4 py-3 font-mono font-semibold text-fd-foreground">
									{param.name}
									{param.required && (
										<span className="ml-1.5 text-red-500 text-[10px]">*</span>
									)}
								</td>
								<td className="px-4 py-3 text-fd-muted-foreground font-mono text-xs">
									{param.type}
								</td>
								<td className="px-4 py-3">
									<span className="rounded bg-fd-muted/50 px-1.5 py-0.5 text-[11px] text-fd-muted-foreground">
										{param.location}
									</span>
								</td>
								<td className="px-4 py-3 text-fd-muted-foreground">
									{param.description || "—"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function ResponseSection({ responses }: { responses: Record<string, any> }) {
	if (!responses || !Object.keys(responses).length) return null;

	const statusColors: Record<string, string> = {
		"2": "text-green-600 dark:text-green-400",
		"4": "text-yellow-600 dark:text-yellow-400",
		"5": "text-red-600 dark:text-red-400",
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-fd-foreground text-lg tracking-tight">
				Responses
			</h3>
			<div className="space-y-3">
				{Object.entries(responses).map(([status, data]) => (
					<div
						key={status}
						className="rounded-xl border border-fd-border bg-fd-background p-4"
					>
						<div className="flex items-center gap-3 mb-2">
							<span
								className={cn(
									"font-mono font-bold text-sm",
									statusColors[status[0]] || "text-fd-foreground",
								)}
							>
								{status}
							</span>
							<span className="text-fd-muted-foreground text-sm">
								{data.description || getDefaultStatusText(status)}
							</span>
						</div>
						{data.schema && (
							<pre className="mt-2 overflow-x-auto rounded-lg bg-fd-muted/10 p-3 text-[12px] font-mono text-fd-muted-foreground">
								<code>{JSON.stringify(data.schema, null, 2)}</code>
							</pre>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function getDefaultStatusText(status: string): string {
	const map: Record<string, string> = {
		"200": "Success",
		"201": "Created",
		"400": "Bad Request",
		"401": "Unauthorized",
		"403": "Forbidden",
		"404": "Not Found",
		"409": "Conflict",
		"500": "Internal Server Error",
	};
	return map[status] || "";
}

export function APIPage({
	document,
	operations,
	parameters = [],
	requestBody,
	responses = {},
}: APIPageProps) {
	const operation = operations?.[0];
	if (!operation) return null;

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(`https://api.reloop.sh${operation.path}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const method = operation.method.toLowerCase() as keyof typeof methodColors;
	const hasBody = ["post", "put", "patch"].includes(method);

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

			{/* Parameters Section - Dynamic from OpenAPI */}
			<ParametersTable parameters={parameters} />

			{/* Response Section */}
			<ResponseSection responses={responses} />

			{/* Code Examples Section - Auto-generated */}
			<div className="space-y-4">
				<h3 className="font-semibold text-fd-foreground text-lg tracking-tight">
					Code Examples
				</h3>
				<CodeGroup>
					<div title="cURL">
						<pre className="bg-fd-muted/10 p-4 rounded-lg overflow-x-auto text-[13px] font-mono">
							<code>{generateCurl(operation.method, operation.path, hasBody)}</code>
						</pre>
					</div>
					<div title="Node.js">
						<pre className="bg-fd-muted/10 p-4 rounded-lg overflow-x-auto text-[13px] font-mono">
							<code>{generateNodeJS(operation.method, operation.path, hasBody)}</code>
						</pre>
					</div>
					<div title="Python">
						<pre className="bg-fd-muted/10 p-4 rounded-lg overflow-x-auto text-[13px] font-mono">
							<code>{generatePython(operation.method, operation.path, hasBody)}</code>
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
