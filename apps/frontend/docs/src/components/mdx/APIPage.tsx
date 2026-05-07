"use client";

import { cn } from "@reloop/ui/cn";
import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import { CodeGroup, CodeBlock as MintlifyCodeBlock } from "./mintlify-client";

interface Parameter {
	name: string;
	type: string;
	required: boolean;
	description: string;
	location: string;
	defaultValue?: any;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	enumValues?: string[];
	pattern?: string;
	example?: any;
}

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

interface APIPageProps {
	document: string;
	operationData: {
		path: string;
		method: string;
	}[];
	parameterList?: Parameter[];
	responseMap?: Record<string, any>;
	codeSamples?: CodeSample[];
}

/* ─── Helpers ───────────────────────────────────────────── */

/** Shorten the internal API path to a clean public-style route. */
function shortenPath(fullPath: string): string {
	// /api/domain/v1/create → /domains
	// /api/domain/v1/{domain_id} → /domains/:domain_id
	return fullPath.replace(/\{([^}]+)\}/g, ":$1");
}

const METHOD_STYLES: Record<string, string> = {
	GET: "bg-green-500/15 text-green-700 dark:text-green-400",
	POST: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	DELETE: "bg-red-500/15 text-red-700 dark:text-red-400",
	PATCH: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
	PUT: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
};

/* ─── Main Component ────────────────────────────────────── */

export function APIPage(props: APIPageProps) {
	const {
		operationData = [],
		parameterList = [],
		responseMap = {},
		codeSamples = [],
	} = props;

	if (
		!operationData ||
		!Array.isArray(operationData) ||
		operationData.length === 0
	) {
		return (
			<div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-600 dark:text-red-400">
				<p className="font-bold">
					Error: API operation data is missing or invalid.
				</p>
			</div>
		);
	}

	const operation = operationData[0];
	const path = operation?.path || "";
	const method = (operation?.method || "GET").toUpperCase();

	const pathParams = parameterList.filter((p) => p.location === "path");
	const queryParams = parameterList.filter((p) => p.location === "query");
	const bodyParams = parameterList.filter((p) => p.location === "body");

	return (
		<div className="relative mt-6 grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1fr)]">
			{/* ─── Left: content ─── */}
			<div className="row-start-1 min-w-0">
				{/* Method + Path */}
				<div className="mb-8 flex items-center gap-2.5">
					<span
						className={cn(
							"rounded-md px-2.5 py-1 font-bold text-[11px] uppercase tracking-wider",
							METHOD_STYLES[method] || METHOD_STYLES.GET,
						)}
					>
						{method}
					</span>
					<code className="font-mono text-[13px] text-fd-muted-foreground">
						{shortenPath(path)}
					</code>
				</div>

				{/* Parameter sections */}
				{pathParams.length > 0 && (
					<ParameterSection title="Path Parameters" params={pathParams} />
				)}
				{bodyParams.length > 0 && (
					<ParameterSection title="Body Parameters" params={bodyParams} />
				)}
				{queryParams.length > 0 && (
					<ParameterSection title="Query Parameters" params={queryParams} />
				)}
			</div>

			{/* ─── Right: sticky code + response ─── */}
			<div className="row-start-1 hidden lg:block">
				<div className="sticky top-24 space-y-6">
					<CodeExamples
						method={method}
						path={path}
						parameters={parameterList}
						codeSamples={codeSamples}
					/>
					<ResponseCard responses={responseMap} />
				</div>
			</div>

			{/* ─── Mobile: code + response below content ─── */}
			<div className="mt-10 space-y-6 lg:hidden">
				<CodeExamples
					method={method}
					path={path}
					parameters={parameterList}
					codeSamples={codeSamples}
				/>
				<ResponseCard responses={responseMap} />
			</div>
		</div>
	);
}

/* ─── Parameter Section ─────────────────────────────────── */

function ParameterSection({
	title,
	params,
}: {
	title: string;
	params: Parameter[];
}) {
	return (
		<section className="mb-10">
			<h2 className="mb-1 font-semibold text-fd-foreground text-lg tracking-tight">
				{title}
			</h2>
			<div className="divide-y divide-fd-border">
				{params.map((param) => (
					<ParameterRow key={`${param.location}-${param.name}`} param={param} />
				))}
			</div>
		</section>
	);
}

function ParameterRow({ param }: { param: Parameter }) {
	return (
		<div className="py-4 first:pt-3">
			{/* Name + type + required */}
			<div className="flex flex-wrap items-baseline gap-2">
				<span className="font-mono font-semibold text-[14px] text-fd-foreground">
					{param.name}
				</span>
				<span className="font-mono text-[12px] text-fd-muted-foreground/70">
					{param.type}
				</span>
				{param.defaultValue !== undefined && (
					<span className="font-mono text-[12px] text-fd-muted-foreground/50">
						default: {JSON.stringify(param.defaultValue)}
					</span>
				)}
				{param.required && (
					<span className="font-semibold text-[11px] text-red-500 uppercase dark:text-red-400">
						Required
					</span>
				)}
			</div>

			{/* Description */}
			{param.description && (
				<p className="mt-1.5 text-[14px] text-fd-muted-foreground leading-relaxed">
					{param.description}
					{/* Append possible values inline like Resend */}
					{param.enumValues && param.enumValues.length > 0 && (
						<>
							{" "}
							Possible values:{" "}
							{param.enumValues.map((v, i) => (
								<span key={v}>
									<code className="rounded bg-fd-muted px-1 py-0.5 text-[12px]">
										{v}
									</code>
									{i < (param.enumValues?.length ?? 0) - 1 && (
										<span className="text-fd-muted-foreground/40">{" | "}</span>
									)}
								</span>
							))}
						</>
					)}
				</p>
			)}

			{/* Show enum if no description */}
			{!param.description &&
				param.enumValues &&
				param.enumValues.length > 0 && (
					<p className="mt-1.5 text-[14px] text-fd-muted-foreground">
						Possible values:{" "}
						{param.enumValues.map((v, i) => (
							<span key={v}>
								<code className="rounded bg-fd-muted px-1 py-0.5 text-[12px]">
									{v}
								</code>
								{i < (param.enumValues?.length ?? 0) - 1 && (
									<span className="text-fd-muted-foreground/40">{" | "}</span>
								)}
							</span>
						))}
					</p>
				)}

			{/* Constraints — shown as bullet points like Resend */}
			{(param.minimum !== undefined ||
				param.maximum !== undefined ||
				param.minLength !== undefined ||
				param.maxLength !== undefined) && (
				<ul className="mt-2 list-inside list-disc space-y-0.5 text-[13px] text-fd-muted-foreground marker:text-fd-muted-foreground/30">
					{param.minimum !== undefined && (
						<li>
							Minimum value:{" "}
							<code className="text-[12px] text-fd-foreground">
								{param.minimum}
							</code>
						</li>
					)}
					{param.maximum !== undefined && (
						<li>
							Maximum value:{" "}
							<code className="text-[12px] text-fd-foreground">
								{param.maximum}
							</code>
						</li>
					)}
					{param.minLength !== undefined && (
						<li>
							Minimum length:{" "}
							<code className="text-[12px] text-fd-foreground">
								{param.minLength}
							</code>
						</li>
					)}
					{param.maxLength !== undefined && (
						<li>
							Maximum length:{" "}
							<code className="text-[12px] text-fd-foreground">
								{param.maxLength}
							</code>
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

/* ─── Response Card ─────────────────────────────────────── */

function ResponseCard({ responses }: { responses: Record<string, any> }) {
	const statusCodes = Object.keys(responses);
	const [activeStatus, setActiveStatus] = useState(statusCodes[0] || "200");

	if (statusCodes.length === 0) return null;

	const activeResponse = responses[activeStatus];
	const jsonStr = JSON.stringify(
		activeResponse?.schema || { message: "Success" },
		null,
		2,
	);

	return (
		<div>
			{/* Status tabs + label */}
			<div className="mb-2 flex items-center gap-2">
				<span className="font-semibold text-[13px] text-fd-foreground">
					Response
				</span>
				{statusCodes.length > 1 && (
					<div className="flex items-center gap-0.5">
						{statusCodes.map((code) => (
							<button
								key={code}
								type="button"
								onClick={() => setActiveStatus(code)}
								className={cn(
									"rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
									activeStatus === code
										? "bg-fd-muted font-semibold text-fd-foreground"
										: "text-fd-muted-foreground/50 hover:text-fd-muted-foreground",
								)}
							>
								{code}
							</button>
						))}
					</div>
				)}
				<div className="ml-auto">
					<CopyButton content={jsonStr} />
				</div>
			</div>

			{/* JSON response body — using Mintlify CodeBlock for syntax highlighting */}
			<div className="[&_.code-group]:!my-0 [&_.code-group]:!mt-0 [&_.code-group]:!mb-0 [&_.mintlify-code-block]:!my-0">
				<MintlifyCodeBlock language="json">{jsonStr}</MintlifyCodeBlock>
			</div>
		</div>
	);
}

/* ─── Code Examples ─────────────────────────────────────── */

function CodeExamples({
	method,
	path,
	parameters,
	codeSamples,
}: {
	method: string;
	path: string;
	parameters: Parameter[];
	codeSamples: CodeSample[];
}) {
	if (codeSamples && codeSamples.length > 0) {
		return (
			<div className="[&_.code-group]:!my-0 [&_.code-group]:!mt-0 [&_.code-group]:!mb-0">
				<CodeGroup isSmallText>
					{codeSamples.map((sample) => (
						<MintlifyCodeBlock
							key={sample.id}
							filename={sample.label}
							language={sample.lang}
						>
							{sample.source}
						</MintlifyCodeBlock>
					))}
				</CodeGroup>
			</div>
		);
	}

	// Fallback: generate basic samples
	const bodyParams = parameters.filter((p) => p.location === "body");
	const queryParams = parameters.filter((p) => p.location === "query");

	const bodyJSON = bodyParams.length
		? JSON.stringify(
				bodyParams.reduce(
					(acc, p) => ({
						...acc,
						[p.name]:
							p.example ??
							(p.type === "number"
								? 0
								: p.type === "boolean"
									? true
									: `${p.name}_value`),
					}),
					{},
				),
				null,
				2,
			)
		: "";

	const qs = queryParams.length
		? `?${queryParams.map((p) => `${p.name}=${p.example || "value"}`).join("&")}`
		: "";

	const curl = `curl -X ${method} \\
  https://api.reloop.sh${path}${qs} \\
  -H "Authorization: Bearer re_123456789"${
		bodyJSON
			? ` \\
  -H "Content-Type: application/json" \\
  -d '${bodyJSON}'`
			: ""
	}`;

	const nodejs = `const response = await fetch("https://api.reloop.sh${path}${qs}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer re_123456789",${
			bodyJSON
				? `
    "Content-Type": "application/json",`
				: ""
		}
  },${
		bodyJSON
			? `
  body: JSON.stringify(${bodyJSON})`
			: ""
	}
});

const data = await response.json();`;

	const python = `import requests

response = requests.${method.toLowerCase()}(
    "https://api.reloop.sh${path}${qs}",
    headers={"Authorization": "Bearer re_123456789"}${
			bodyJSON
				? `,
    json=${bodyJSON}`
				: ""
		}
)

print(response.json())`;

	return (
		<div className="[&_.code-group]:!my-0 [&_.code-group]:!mt-0 [&_.code-group]:!mb-0">
			<CodeGroup isSmallText>
				<MintlifyCodeBlock filename="Node.js" language="javascript">
					{nodejs}
				</MintlifyCodeBlock>
				<MintlifyCodeBlock filename="cURL" language="bash">
					{curl}
				</MintlifyCodeBlock>
				<MintlifyCodeBlock filename="Python" language="python">
					{python}
				</MintlifyCodeBlock>
			</CodeGroup>
		</div>
	);
}

/* ─── Copy Button ───────────────────────────────────────── */

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
			className="flex h-6 w-6 items-center justify-center rounded text-fd-muted-foreground/50 transition hover:text-fd-foreground"
			aria-label="Copy to clipboard"
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-green-500" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}
