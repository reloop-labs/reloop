import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";
import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import { useHotkeys } from "react-hotkeys-hook";

const codeExamples = {
	javascript: {
		create: `const response = await fetch("https://api.reloop.sh/webhook/v1/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    url: "https://example.com/webhook",
    events: ["contact.created", "contact.updated"],
  }),
});

const webhook = await response.json();`,
		list: `const response = await fetch(
  "https://api.reloop.sh/webhook/v1/?page=1&limit=10",
  {
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const webhooks = await response.json();`,
		delete: `const response = await fetch(
  "https://api.reloop.sh/webhook/v1/webhook_id",
  {
    method: "DELETE",
    credentials: "include",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  },
);

const result = await response.json();`,
	},
	python: {
		create: `import requests

response = requests.post(
    "https://api.reloop.sh/webhook/v1/",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY",
    },
    json={
        "url": "https://example.com/webhook",
        "events": ["contact.created", "contact.updated"],
    },
)

webhook = response.json()`,
		list: `import requests

response = requests.get(
    "https://api.reloop.sh/webhook/v1/?page=1&limit=10",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

webhooks = response.json()`,
		delete: `import requests

response = requests.delete(
    "https://api.reloop.sh/webhook/v1/webhook_id",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
    },
)

result = response.json()`,
	},
	php: {
		create: `<?php
$payload = [
    "url" => "https://example.com/webhook",
    "events" => ["contact.created", "contact.updated"],
];

$ch = curl_init("https://api.reloop.sh/webhook/v1/");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$webhook = curl_exec($ch);
curl_close($ch);
?>`,
		list: `<?php
$ch = curl_init("https://api.reloop.sh/webhook/v1/?page=1&limit=10");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$webhooks = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
$ch = curl_init("https://api.reloop.sh/webhook/v1/webhook_id");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_API_KEY",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
	},
};

const operations = [
	{
		id: "create",
		label: "Create Webhook",
		method: "POST",
		endpoint: "/webhook/v1/",
	},
	{
		id: "list",
		label: "List Webhooks",
		method: "GET",
		endpoint: "/webhook/v1/",
	},
	{
		id: "delete",
		label: "Delete Webhook",
		method: "DELETE",
		endpoint: "/webhook/v1/:id",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type Language = keyof typeof codeExamples;
type Operation = (typeof operations)[number]["id"];
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

const getMethodColor = (
	method: string,
): "green" | "blue" | "red" | "yellow" => {
	switch (method) {
		case "POST":
			return "green";
		case "DELETE":
			return "red";
		case "PATCH":
			return "yellow";
		default:
			return "blue";
	}
};

export const WebhooksApiDetails = (props: ButtonProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOperation, setSelectedOperation] =
		useState<Operation>("create");
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<Language>(
		languages.map((l) => l.id),
		"javascript",
	);
	const [copied, setCopied] = useState(false);
	const [baseCopied, setBaseCopied] = useState(false);

	useHotkeys("c", (e) => {
		e.preventDefault();
		setIsOpen(true);
	});

	const {
		variant = "neutral",
		mode = "ghost",
		size = "xxsmall",
		className,
		...rest
	} = props;

	const currentLanguageConfig = languages.find(
		(language) => language.id === selectedLanguage,
	);
	const currentOperation = operations.find(
		(operation) => operation.id === selectedOperation,
	);

	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(
				codeExamples[selectedLanguage][selectedOperation],
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	}, [selectedLanguage, selectedOperation]);

	const copyBaseUrl = useCallback(async () => {
		try {
			await navigator.clipboard.writeText("https://api.reloop.sh");
			setBaseCopied(true);
			setTimeout(() => setBaseCopied(false), 2000);
		} catch {}
	}, []);

	return (
		<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Drawer.Trigger asChild>
							<Button.Root
								variant={variant}
								size={size}
								mode={mode}
								className={cn(
									"aspect-square p-0",
									isOpen && "bg-bg-weak-50",
									className,
								)}
								{...rest}
							>
								<Icon name="code" className="h-4 w-4" />
							</Button.Root>
						</Drawer.Trigger>
					</Tooltip.Trigger>
					<Tooltip.Content className="flex items-center gap-2 rounded-lg">
						<p className="font-medium text-label-sm">Webhooks API</p>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							C
						</span>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<Drawer.Content className="max-w-[520px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Webhooks API</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Create and manage Webhooks programmatically with the REST API
						</p>
					</div>
				</Drawer.Header>
				<Drawer.Body className="flex flex-col gap-5 p-5">
					{/* Base URL Card */}
					<div className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-3 py-2.5">
						<div className="flex items-center gap-2">
							<Icon name="link-02" className="h-4 w-4 text-text-sub-600" />
							<code className="font-mono text-label-sm text-text-strong-950">
								https://api.reloop.sh
							</code>
						</div>
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Button.Root
										variant="neutral"
										size="xxsmall"
										mode="ghost"
										onClick={copyBaseUrl}
									>
										<Icon
											name={baseCopied ? "check" : "clipboard-copy"}
											className={cn(
												"h-3.5 w-3.5",
												baseCopied && "text-success-base",
											)}
										/>
									</Button.Root>
								</Tooltip.Trigger>
								<Tooltip.Content size="xsmall">
									{baseCopied ? "Copied!" : "Copy base URL"}
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>

					{/* Language Selector */}
					<div className="space-y-2.5">
						<h3 className="text-label-sm text-text-sub-600">Language</h3>
						<div className="grid grid-cols-3 gap-1 rounded-lg bg-bg-weak-50 p-1">
							{languages.map((language) => (
								<button
									type="button"
									key={language.id}
									onClick={() => setSelectedLanguage(language.id)}
									className={cn(
										"rounded-md px-3 py-1.5 font-medium text-label-sm transition-all duration-200",
										"text-text-sub-600 hover:text-text-strong-950",
										selectedLanguage === language.id &&
											"bg-bg-white-0 text-text-strong-950 shadow-sm",
									)}
								>
									{language.label}
								</button>
							))}
						</div>
					</div>

					{/* Endpoints */}
					<div className="space-y-2.5">
						<h3 className="text-label-sm text-text-sub-600">Endpoints</h3>
						<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
							{operations.map((operation) => {
								const isSelected = selectedOperation === operation.id;
								return (
									<button
										type="button"
										key={operation.id}
										onClick={() => setSelectedOperation(operation.id)}
										className={cn(
											"group flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-150",
											"border-l-2",
											isSelected
												? "border-l-text-strong-950 bg-bg-weak-50"
												: "border-l-transparent hover:bg-bg-weak-50/60",
										)}
									>
										<Badge.Root
											variant="light"
											size="small"
											color={getMethodColor(operation.method)}
											className="w-[52px] justify-center font-mono text-[10px]"
										>
											{operation.method}
										</Badge.Root>
										<code
											className={cn(
												"flex-1 font-mono text-[11px] transition-colors",
												isSelected
													? "text-text-strong-950"
													: "text-text-sub-500 group-hover:text-text-strong-950",
											)}
										>
											{operation.endpoint}
										</code>
										<span
											className={cn(
												"flex-shrink-0 text-label-xs transition-colors",
												isSelected
													? "text-text-sub-600"
													: "text-text-sub-400 group-hover:text-text-sub-600",
											)}
										>
											{operation.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Code Example */}
					{currentOperation && (
						<div className="space-y-2.5">
							<div className="flex items-center justify-between">
								<h3 className="text-label-sm text-text-sub-600">Example</h3>
								<Button.Root
									variant="neutral"
									size="xxsmall"
									mode="ghost"
									onClick={copyToClipboard}
									className="gap-1.5"
								>
									<Icon
										name={copied ? "check" : "clipboard-copy"}
										className={cn("h-3.5 w-3.5", copied && "text-success-base")}
									/>
									{copied ? "Copied!" : "Copy"}
								</Button.Root>
							</div>
							<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50">
								<CodeBlock
									code={codeExamples[selectedLanguage][selectedOperation]}
									lang={currentLanguageConfig?.shikiLang || "javascript"}
								/>
							</div>
						</div>
					)}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
