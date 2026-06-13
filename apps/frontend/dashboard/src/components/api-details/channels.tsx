import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";

const codeExamples = {
	javascript: {
		add: `// Create a new channel
const response = await fetch('/api/contacts/v1/channels/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Newsletter',
    description: 'Weekly newsletter subscribers'
  })
});

const result = await response.json();`,
		list: `// List all channels
const response = await fetch('/api/contacts/v1/channels/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const channels = await response.json();`,
		delete: `// Delete a channel
const response = await fetch('/api/contacts/v1/channels/channel_123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const result = await response.json();`,
		subscribe: `// Subscribe contact to channel
const response = await fetch('/api/contacts/v1/subscriptions/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    contactId: 'contact_123',
    channelId: 'channel_123'
  })
});

const result = await response.json();`,
	},
	python: {
		add: `# Create a new channel
import requests

response = requests.post('/api/contacts/v1/channels/create',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'name': 'Newsletter',
    'description': 'Weekly newsletter subscribers'
  }
)

result = response.json()`,
		list: `# List all channels
import requests

response = requests.get('/api/contacts/v1/channels/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

channels = response.json()`,
		delete: `# Delete a channel
import requests

response = requests.delete('/api/contacts/v1/channels/channel_123',
  headers={
    'Authorization': 'Bearer YOUR_API_KEY'
  }
)

result = response.json()`,
		subscribe: `# Subscribe contact to channel
import requests

response = requests.post('/api/contacts/v1/subscriptions/subscribe',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'contactId': 'contact_123',
    'channelId': 'channel_123'
  }
)

result = response.json()`,
	},
	php: {
		add: `<?php
// Create a new channel
$data = [
    'name' => 'Newsletter',
    'description' => 'Weekly newsletter subscribers'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/create');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		list: `<?php
// List all channels
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/list?page=1&limit=10');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$channels = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
// Delete a channel
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/channels/channel_123');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		subscribe: `<?php
// Subscribe contact to channel
$data = [
    'contactId' => 'contact_123',
    'channelId' => 'channel_123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/subscriptions/subscribe');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
	},
};

const operations = [
	{
		id: "add",
		label: "Create Channel",
		method: "POST",
		endpoint: "/api/contacts/v1/channels/create",
	},
	{
		id: "list",
		label: "List Channels",
		method: "GET",
		endpoint: "/api/contacts/v1/channels/list",
	},
	{
		id: "subscribe",
		label: "Subscribe",
		method: "POST",
		endpoint: "/api/contacts/v1/subscriptions/subscribe",
	},
	{
		id: "delete",
		label: "Delete Channel",
		method: "DELETE",
		endpoint: "/api/contacts/v1/channels/:channel_id",
	},
];

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type Language = keyof typeof codeExamples;
type Operation = "add" | "list" | "subscribe" | "delete";

const getMethodColor = (method: string): "green" | "blue" | "red" => {
	switch (method) {
		case "POST":
			return "green";
		case "DELETE":
			return "red";
		default:
			return "blue";
	}
};

export const ChannelsApiDetails = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOperation, setSelectedOperation] = useState<Operation>("add");
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<Language>(
		languages.map((l) => l.id),
		"javascript",
	);
	const [copied, setCopied] = useState(false);

	const currentLanguageConfig = languages.find(
		(l) => l.id === selectedLanguage,
	);
	const currentOperation = operations.find((op) => op.id === selectedOperation);

	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(
				codeExamples[selectedLanguage][selectedOperation],
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	}, [selectedLanguage, selectedOperation]);

	return (
		<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
			<Drawer.Trigger asChild>
				<Button.Root
					variant="neutral"
					size="xxsmall"
					mode="ghost"
					className={cn("gap-1.5", isOpen && "bg-bg-weak-50")}
				>
					<Icon name="code" className="h-4 w-4" />
					API
					<KbdKeyOutline>A</KbdKeyOutline>
				</Button.Root>
			</Drawer.Trigger>
			<Drawer.Content className="max-w-[520px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Channels API</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Manage channels programmatically with our REST API
						</p>
					</div>
				</Drawer.Header>
				<Drawer.Body className="flex flex-col gap-5 p-5">
					{/* Language Selector */}
					<div className="space-y-2.5">
						<h3 className="text-label-sm text-text-sub-600">Language</h3>
						<div className="grid grid-cols-3 gap-1 rounded-lg bg-bg-weak-50 p-1">
							{languages.map((lang) => (
								<button
									type="button"
									key={lang.id}
									onClick={() => setSelectedLanguage(lang.id)}
									className={cn(
										"rounded-md px-3 py-1.5 font-medium text-label-sm transition-all duration-200",
										"text-text-sub-600 hover:text-text-strong-950",
										selectedLanguage === lang.id &&
											"bg-bg-white-0 text-text-strong-950 shadow-sm",
									)}
								>
									{lang.label}
								</button>
							))}
						</div>
					</div>

					{/* Endpoints */}
					<div className="space-y-2.5">
						<h3 className="text-label-sm text-text-sub-600">Endpoints</h3>
						<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
							{operations.map((op) => {
								const isSelected = selectedOperation === op.id;
								return (
									<button
										type="button"
										key={op.id}
										onClick={() => setSelectedOperation(op.id as Operation)}
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
											color={getMethodColor(op.method)}
											className="w-[52px] justify-center font-mono text-[10px]"
										>
											{op.method}
										</Badge.Root>
										<code
											className={cn(
												"flex-1 font-mono text-[11px] transition-colors",
												isSelected
													? "text-text-strong-950"
													: "text-text-sub-500 group-hover:text-text-strong-950",
											)}
										>
											{op.endpoint}
										</code>
										<span
											className={cn(
												"flex-shrink-0 text-label-xs transition-colors",
												isSelected
													? "text-text-sub-600"
													: "text-text-sub-400 group-hover:text-text-sub-600",
											)}
										>
											{op.label}
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
