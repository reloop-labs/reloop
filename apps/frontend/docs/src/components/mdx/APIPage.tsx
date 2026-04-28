"use client";

import { cn } from "@reloop/ui/cn";
import { Check, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { useState, ReactNode } from "react";

interface Parameter {
	name: string;
	type: string;
	required: boolean;
	description: string;
	location: string;
}

interface APIPageProps {
	document: string;
	operationData: {
		path: string;
		method: string;
	}[];
	parameterList?: Parameter[];
	responseMap?: Record<string, any>;
}

export function APIPage(props: APIPageProps) {
	const { operationData = [], parameterList = [], responseMap = {} } = props;

	// Safety check for operations
	if (!operationData || !Array.isArray(operationData) || operationData.length === 0) {
		return (
			<div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-600 dark:text-red-400">
				<p className="font-bold">Error: API operation data is missing or invalid.</p>
			</div>
		);
	}

	const operation = operationData[0];
	const path = operation?.path || "";
	const method = operation?.method || "GET";

	return (
		<div className="relative mt-8 flex flex-col gap-12 lg:grid lg:grid-cols-[1fr_400px] lg:gap-16">
			{/* Left Column: Content */}
			<div className="min-w-0 space-y-12">
				{/* Method & Path Header */}
				<div className="flex items-center gap-3 rounded-xl border border-fd-border bg-fd-muted/30 p-3 font-mono text-[13px]">
					<span
						className={cn(
							"rounded-md px-2 py-0.5 font-bold text-[11px] uppercase tracking-wider",
							method.toUpperCase() === "GET" && "bg-green-500/10 text-green-600 dark:text-green-400",
							method.toUpperCase() === "POST" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
							method.toUpperCase() === "DELETE" && "bg-red-500/10 text-red-600 dark:text-red-400",
							method.toUpperCase() === "PATCH" && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
							method.toUpperCase() === "PUT" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
						)}
					>
						{method.toUpperCase()}
					</span>
					<span className="text-fd-muted-foreground/80">{path}</span>
				</div>

				{/* Parameters Section */}
				{parameterList.length > 0 && (
					<div className="space-y-6">
						<h2 className="font-bold text-xl tracking-tight">Parameters</h2>
						<div className="flex flex-col border-fd-border border-t">
							{parameterList.map((param) => (
								<ParameterItem key={`${param.location}-${param.name}`} param={param} />
							))}
						</div>
					</div>
				)}

				{/* Responses Section (Mobile Only) */}
				<div className="lg:hidden">
					<h2 className="mb-6 font-bold text-xl tracking-tight">Response</h2>
					<ResponseSection responses={responseMap} />
				</div>
			</div>

			{/* Right Column: Sticky Code Examples & Responses */}
			<aside className="hidden lg:block">
				<div className="sticky top-24 flex flex-col gap-8">
					<div className="space-y-4">
						<h3 className="font-semibold text-[11px] text-fd-muted-foreground/60 uppercase tracking-[0.1em]">
							Request
						</h3>
						<CodeExamples method={method} path={path} parameters={parameterList} />
					</div>

					<div className="space-y-4">
						<h3 className="font-semibold text-[11px] text-fd-muted-foreground/60 uppercase tracking-[0.1em]">
							Response
						</h3>
						<ResponseSection responses={responseMap} />
					</div>
				</div>
			</aside>
		</div>
	);
}

function ParameterItem({ param }: { param: Parameter }) {
	return (
		<div className="group flex flex-col gap-2 border-fd-border border-b py-5 last:border-0">
			<div className="flex items-center gap-2.5">
				<code className="font-bold font-mono text-[14px] text-fd-foreground">
					{param.name}
				</code>
				<div className="flex items-center gap-1.5">
					<span className="rounded bg-fd-muted px-1.5 py-0.5 font-medium font-mono text-[10px] text-fd-muted-foreground uppercase">
						{param.type}
					</span>
					{param.required ? (
						<span className="rounded bg-red-500/10 px-1.5 py-0.5 font-medium text-[10px] text-red-600 dark:text-red-400">
							Required
						</span>
					) : (
						<span className="rounded bg-fd-muted px-1.5 py-0.5 font-medium text-[10px] text-fd-muted-foreground/60">
							Optional
						</span>
					)}
					<span className="rounded bg-fd-muted/50 px-1.5 py-0.5 font-medium text-[10px] text-fd-muted-foreground/40 italic">
						{param.location}
					</span>
				</div>
			</div>
			{param.description && (
				<p className="max-w-[600px] text-[14px] text-fd-muted-foreground leading-relaxed">
					{param.description}
				</p>
			)}
		</div>
	);
}

function ResponseSection({ responses }: { responses: Record<string, any> }) {
	const [activeStatus, setActiveStatus] = useState(Object.keys(responses)[0] || "200");

	if (Object.keys(responses).length === 0) {
		return (
			<div className="rounded-xl border border-fd-border bg-fd-muted/20 p-8 text-center text-fd-muted-foreground text-sm">
				No response schema defined.
			</div>
		);
	}

	const activeResponse = responses[activeStatus];
	const schemaStr = JSON.stringify(activeResponse?.schema || { message: "Success" }, null, 2);

	return (
		<div className="flex flex-col gap-3">
			{/* Status Selector */}
			<div className="flex flex-wrap gap-2">
				{Object.keys(responses).map((status) => (
					<button
						key={status}
						type="button"
						onClick={() => setActiveStatus(status)}
						className={cn(
							"rounded-lg border px-3 py-1.5 font-mono text-xs transition-all",
							activeStatus === status
								? "border-fd-foreground bg-fd-foreground text-fd-background shadow-sm"
								: "border-fd-border bg-fd-background text-fd-muted-foreground hover:border-fd-foreground/20",
						)}
					>
						{status}
					</button>
				))}
			</div>

			{/* Response Body */}
			<div className="relative overflow-hidden rounded-xl border border-fd-border bg-[#0d1117]">
				<div className="flex items-center justify-between border-fd-border/50 border-b bg-fd-foreground/[0.03] px-4 py-2">
					<span className="font-medium text-[10px] text-fd-muted-foreground/60 uppercase tracking-[0.05em]">
						JSON
					</span>
					<CopyButton content={schemaStr} />
				</div>
				<pre className="max-h-[400px] overflow-auto p-4 font-mono text-[12px] text-fd-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-fd-border hover:scrollbar-thumb-fd-foreground/20">
					{schemaStr}
				</pre>
			</div>
		</div>
	);
}

function CodeExamples({
	method,
	path,
	parameters,
}: {
	method: string;
	path: string;
	parameters: Parameter[];
}) {
	const [activeTab, setActiveTab] = useState("curl");

	const bodyParams = parameters.filter((p) => p.location === "body");
	const queryParams = parameters.filter((p) => p.location === "query");

	const bodyJSON = bodyParams.length
		? JSON.stringify(
				bodyParams.reduce((acc, p) => ({ ...acc, [p.name]: `"${p.name}_value"` }), {}),
				null,
				2,
			)
		: "";

	const curl = `curl -X ${method.toUpperCase()} "https://api.reloop.sh${path}${queryParams.length ? `?${queryParams.map((p) => `${p.name}=value`).join("&")}` : ""}" \\
  -H "x-api-key: YOUR_API_KEY" \\
  ${bodyJSON ? `-H "Content-Type: application/json" \\
  -d '${bodyJSON}'` : ""}`;

	const nodejs = `const response = await fetch("https://api.reloop.sh${path}", {
  method: "${method.toUpperCase()}",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    ${bodyJSON ? '"Content-Type": "application/json",' : ""}
  },
  ${bodyJSON ? `body: JSON.stringify(${bodyJSON})` : ""}
});

const data = await response.json();`;

	const python = `import requests

response = requests.${method.toLowerCase()}(
    "https://api.reloop.sh${path}",
    headers={"x-api-key": "YOUR_API_KEY"}${bodyJSON ? `,\n    json=${bodyJSON}` : ""}
)

print(response.json())`;

	return (
		<div className="w-full">
			<div className="mb-3 flex items-center gap-1 overflow-x-auto rounded-lg bg-fd-muted/30 p-1">
				{["curl", "nodejs", "python"].map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						className={cn(
							"rounded-md px-3 py-1.5 font-medium text-[11px] transition-all",
							activeTab === tab
								? "bg-fd-background text-fd-foreground shadow-sm"
								: "text-fd-muted-foreground hover:bg-fd-background/50 hover:text-fd-foreground",
						)}
					>
						{tab === "curl" ? "cURL" : tab === "nodejs" ? "Node.js" : "Python"}
					</button>
				))}
			</div>

			{activeTab === "curl" && <CodeBlock code={curl} language="bash" />}
			{activeTab === "nodejs" && <CodeBlock code={nodejs} language="javascript" />}
			{activeTab === "python" && <CodeBlock code={python} language="python" />}
		</div>
	);
}

function CodeBlock({ code, language }: { code: string; language: string }) {
	return (
		<div className="relative group overflow-hidden rounded-xl border border-fd-border bg-[#0d1117]">
			<div className="flex items-center justify-between bg-fd-foreground/[0.03] px-4 py-2 border-b border-fd-border/50">
				<span className="font-medium text-[10px] text-fd-muted-foreground/60 uppercase tracking-[0.05em]">
					{language}
				</span>
				<CopyButton content={code} />
			</div>
			<pre className="max-h-[350px] overflow-auto p-4 font-mono text-[12px] text-fd-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-fd-border hover:scrollbar-thumb-fd-foreground/20">
				<code>{code}</code>
			</pre>
		</div>
	);
}

function CopyButton({ content }: { content: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="flex h-7 w-7 items-center justify-center rounded-md text-fd-muted-foreground transition-all hover:bg-fd-foreground/10 hover:text-fd-foreground active:scale-95"
		>
			{copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
		</button>
	);
}
