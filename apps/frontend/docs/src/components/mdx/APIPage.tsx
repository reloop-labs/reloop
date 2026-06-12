"use client";

import { CodePortal } from "@reloop/fe-docs/components/docs/code-column-context";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useState } from "react";
import {
	siDotnet,
	siGnubash,
	siGo,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";

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
	properties?: Parameter[];
}

const PARAM_SUB_PROPERTIES: Record<string, Parameter[]> = {
	channels: [
		{
			name: "id",
			type: "string",
			required: false,
			description: "The unique identifier of the channel.",
			location: "body",
		},
		{
			name: "name",
			type: "string",
			required: false,
			description: "The name of the channel.",
			location: "body",
		},
		{
			name: "subscription",
			type: '"opt_in" | "opt_out"',
			required: false,
			description: "The subscription status for this channel.",
			location: "body",
			enumValues: ["opt_in", "opt_out"],
		},
	],
	attachments: [
		{
			name: "content",
			type: "string",
			required: false,
			description: "Base64 encoded content of the attachment.",
			location: "body",
		},
		{
			name: "filename",
			type: "string",
			required: true,
			description: "Filename of the attachment.",
			location: "body",
		},
		{
			name: "path",
			type: "string",
			required: false,
			description: "Path/URL to the file to attach.",
			location: "body",
		},
		{
			name: "contentType",
			type: "string",
			required: false,
			description: "MIME type of the attachment.",
			location: "body",
		},
	],
	tags: [
		{
			name: "name",
			type: "string",
			required: true,
			description: "The name of the custom tag.",
			location: "body",
		},
		{
			name: "value",
			type: "string",
			required: true,
			description: "The value of the custom tag.",
			location: "body",
		},
	],
	template: [
		{
			name: "name",
			type: "string",
			required: true,
			description: "The name of the template to use.",
			location: "body",
		},
		{
			name: "data",
			type: "object",
			required: false,
			description:
				"Dynamic key-value variables to populate template placeholders.",
			location: "body",
		},
	],
	properties: [
		{
			name: "key",
			type: "string",
			required: true,
			description: "The property key.",
			location: "body",
		},
		{
			name: "value",
			type: "string",
			required: true,
			description: "The property value.",
			location: "body",
		},
	],
};

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
	// /api/domain/v1/create → /domain/v1/create
	// /api/domain/v1/{domain_id} → /domain/v1/:domain_id
	const clean = fullPath.replace(/\{([^}]+)\}/g, ":$1");
	// Remove the leading /api prefix for cleaner display
	return clean.replace(/^\/api/, "");
}

function getTypeBadgeStyles(type: string): string {
	const lower = type.toLowerCase().trim();

	// Check for string literal unions/enums (starts with quotes or contains pipes)
	if (lower.startsWith('"') || lower.startsWith("'") || lower.includes("|")) {
		return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/15";
	}

	if (lower.startsWith("string")) {
		return "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/15";
	}

	if (
		lower.startsWith("number") ||
		lower.startsWith("integer") ||
		lower.startsWith("float") ||
		lower.startsWith("double")
	) {
		return "bg-purple-500/10 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-500/15";
	}

	if (lower.startsWith("boolean")) {
		return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/15";
	}

	if (
		lower.includes("object") ||
		lower.includes("record") ||
		lower.startsWith("map")
	) {
		return "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/15";
	}

	if (lower.includes("[]") || lower.startsWith("array")) {
		return "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/15";
	}

	// Default fallback
	return "bg-neutral-500/10 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400 border border-neutral-500/15";
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

	const codeColumn = (
		<div className="api-code-panel space-y-6">
			<CodeExamples
				method={method}
				path={path}
				parameters={parameterList}
				codeSamples={codeSamples}
			/>
			<ResponseCard responses={responseMap} />
		</div>
	);

	return (
		<>
			{/* ─── Left: endpoint + parameters ─── */}
			<div className="min-w-0">
				{/* Method + Path */}
				<div className="api-endpoint-bar mb-8 flex items-center gap-3 rounded-xl border px-4 py-3">
					<span
						className={cn(
							"shrink-0 rounded-md px-2 py-0.5 font-bold text-[11px] uppercase tracking-wider",
							METHOD_STYLES[method] || METHOD_STYLES.GET,
						)}
					>
						{method}
					</span>
					<code className="min-w-0 break-all font-mono text-[13px] text-fd-foreground">
						https://api.reloop.sh{path.replace(/\{([^}]+)\}/g, ":$1")}
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

			{/* ─── Desktop: teleport to page-level sticky column ─── */}
			<CodePortal>{codeColumn}</CodePortal>

			{/* ─── Mobile: code + response below content ─── */}
			<div className="mt-10 lg:hidden">{codeColumn}</div>
		</>
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
		<section>
			<h2 className="mb-4 flex items-center gap-2 font-semibold text-base text-fd-foreground tracking-tight">
				{title}
			</h2>
			<div className="api-parameter-list divide-y divide-stroke-soft-200">
				{params.map((param) => (
					<ParameterRow key={`${param.location}-${param.name}`} param={param} />
				))}
			</div>
		</section>
	);
}

function ParameterRow({
	param,
	depth = 0,
}: {
	param: Parameter;
	depth?: number;
}) {
	const resolvedProperties =
		param.properties || PARAM_SUB_PROPERTIES[param.name];
	const hasProperties = resolvedProperties && resolvedProperties.length > 0;

	return (
		<div className={cn(depth === 0 ? "pt-3.5 pb-0.5" : "py-2.5")}>
			{/* Name + type + required */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="font-mono font-semibold text-[13.5px] text-fd-foreground tracking-tight">
					{param.name}
				</span>
				{param.type.includes("|") ? (
					param.type
						.split("|")
						.map((t) => t.trim())
						.filter(Boolean)
						.map((t, idx) => (
							<span
								key={idx}
								className={cn(
									"rounded-lg px-1.5 font-semibold text-[11px] tracking-tight",
									getTypeBadgeStyles(t),
								)}
							>
								{t}
							</span>
						))
				) : (
					<span
						className={cn(
							"rounded-lg px-1.5 font-semibold text-[11px] tracking-tight",
							getTypeBadgeStyles(param.type),
						)}
					>
						{param.type}
					</span>
				)}
				{param.defaultValue !== undefined && (
					<span className="rounded-lg px-1.5 font-semibold text-[11px] tracking-tight border border-primary-base/20 bg-primary-alpha-10 text-primary-base">
						default: {JSON.stringify(param.defaultValue)}
					</span>
				)}
				{param.required && (
					<span className="rounded-md bg-red-500/10 px-1.5 py-0.5 font-semibold text-[10px] text-red-500 uppercase tracking-wider dark:text-red-400">
						required
					</span>
				)}
			</div>

			{/* Description */}
			{param.description && (
				<p className="mt-2 text-[13.5px] text-text-sub-600 leading-relaxed">
					{param.description}
					{/* Append possible values inline like Resend */}
					{param.enumValues && param.enumValues.length > 0 && (
						<>
							{" "}
							Possible values:{" "}
							{param.enumValues.map((v, i) => (
								<span key={v}>
									<code className="rounded bg-bg-weak-50 px-1 py-0.5 text-[11px] dark:bg-white/5">
										{v}
									</code>
									{i < (param.enumValues?.length ?? 0) - 1 && (
										<span className="text-text-sub-600/40">{" | "}</span>
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
					<p className="mt-1.5 text-[14px] text-text-sub-600">
						Possible values:{" "}
						{param.enumValues.map((v, i) => (
							<span key={v}>
								<code className="rounded bg-bg-weak-50 px-1 py-0.5 text-[12px] dark:bg-white/5">
									{v}
								</code>
								{i < (param.enumValues?.length ?? 0) - 1 && (
									<span className="text-text-sub-600/40">{" | "}</span>
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
				<ul className="mt-2 list-inside list-disc space-y-0.5 text-[13px] text-text-sub-600 marker:text-text-sub-600/30">
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

			{/* Recursive sub-properties */}
			{hasProperties && (
				<div className="mt-3 mb-6 overflow-hidden rounded-xl border border-stroke-soft-200 bg-neutral-50/30 shadow-none dark:border-stroke-soft-100/40 dark:bg-white/[0.01]">
					<div className="select-none px-4 py-2.5 font-semibold text-[13px] text-text-sub-600">
						{param.name === "properties"
							? "Custom properties"
							: `${param.name} properties`}
					</div>

					<div className="border-stroke-soft-200 border-t px-4 dark:border-stroke-soft-100/40">
						{resolvedProperties.map((child, index) => (
							<div
								key={child.name}
								className={cn(
									index > 0 &&
										"border-stroke-soft-200/50 border-t dark:border-stroke-soft-100/10",
								)}
							>
								<ParameterRow param={child} depth={depth + 1} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Response Card ─────────────────────────────────────── */

const LANGUAGE_ICONS: Record<string, any> = {
	node: siNodedotjs,
	nodejs: siNodedotjs,
	javascript: siNodedotjs,
	js: siNodedotjs,
	typescript: siNodedotjs,
	ts: siNodedotjs,
	php: siPhp,
	python: siPython,
	ruby: siRuby,
	go: siGo,
	rust: siRust,
	java: siOpenjdk,
	dotnet: siDotnet,
	csharp: siDotnet,
	curl: siGnubash,
	bash: siGnubash,
	shell: siGnubash,
};

function getIconForSample(sampleId: string, lang: string) {
	const icon =
		LANGUAGE_ICONS[sampleId.toLowerCase()] ||
		LANGUAGE_ICONS[lang.toLowerCase()] ||
		siGnubash;
	return {
		path: icon.path,
		hex: icon.hex,
	};
}

const STATUS_LABELS: Record<string, string> = {
	"200": "200 OK",
	"201": "201 Created",
	"202": "202 Accepted",
	"204": "204 No Content",
	"400": "400 Bad Request",
	"401": "401 Unauthorized",
	"403": "403 Forbidden",
	"404": "404 Not Found",
	"409": "409 Conflict",
	"422": "422 Unprocessable Entity",
	"429": "429 Too Many Requests",
	"500": "500 Internal Error",
};

function getStatusIcon(statusCode: string) {
	const code = Number.parseInt(statusCode, 10);
	if (code >= 200 && code < 300) {
		return {
			path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
			hex: "10b981", // emerald
		};
	}
	if (code >= 400 && code < 500) {
		return {
			path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
			hex: "ef4444", // red
		};
	}
	return {
		path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
		hex: "f59e0b", // amber
	};
}

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

	const tabs = statusCodes.map((code) => ({
		id: code,
		label: STATUS_LABELS[code] || code,
		si: getStatusIcon(code),
	}));

	return (
		<CopyCodeBlock
			code={jsonStr}
			lang="json"
			tabs={tabs}
			activeTab={activeStatus}
			onTabChange={setActiveStatus}
			windowTitle="Response"
			noScroll={false}
			maxHeight="340px"
		/>
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
	const [activeTab, setActiveTab] = useState("");

	// Fallback generated samples if codeSamples is empty
	let samples = codeSamples;
	if (!samples || samples.length === 0) {
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

		samples = [
			{ id: "node", lang: "javascript", label: "Node.js", source: nodejs },
			{ id: "curl", lang: "bash", label: "cURL", source: curl },
			{ id: "python", lang: "python", label: "Python", source: python },
		];
	}

	const resolvedActiveTab =
		activeTab && samples.some((s) => s.id === activeTab)
			? activeTab
			: samples[0]?.id || "";

	const activeSample =
		samples.find((s) => s.id === resolvedActiveTab) || samples[0];

	if (!activeSample) return null;

	const tabs = samples.map((sample) => ({
		id: sample.id,
		label: sample.label,
		si: getIconForSample(sample.id, sample.lang),
	}));

	return (
		<CopyCodeBlock
			code={activeSample.source}
			lang={activeSample.lang}
			tabs={tabs}
			activeTab={resolvedActiveTab}
			onTabChange={setActiveTab}
			noScroll={false}
		/>
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
			className="flex h-6 w-6 items-center justify-center rounded text-text-sub-600/50 transition hover:text-fd-foreground"
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
