import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import * as Table from "@reloop/ui/table";
import * as Kbd from "@reloop/ui/kbd";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

const codeExamples = {
	javascript: {
		add: `// Add a new contact
const response = await fetch('/api/contacts/v1/contacts/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    metadata: { source: 'website' }
  })
});

const result = await response.json();`,
		list: `// List all contacts
const response = await fetch('/api/contacts/v1/contacts/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const contacts = await response.json();`,
		delete: `// Delete a contact
const response = await fetch('/api/contacts/v1/contacts/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    email: 'john@example.com'
  })
});

const result = await response.json();`,
		update: `// Update a contact
const response = await fetch('/api/contacts/v1/contacts/update', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Smith'
  })
});

const result = await response.json();`,
	},
	python: {
		add: `# Add a new contact
import requests

response = requests.post('/api/contacts/v1/contacts/add',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'email': 'john@example.com',
    'firstName': 'John',
    'lastName': 'Doe',
    'metadata': {'source': 'website'}
  }
)

result = response.json()`,
		list: `# List all contacts
import requests

response = requests.get('/api/contacts/v1/contacts/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

contacts = response.json()`,
		delete: `# Delete a contact
import requests

response = requests.delete('/api/contacts/v1/contacts/delete',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={'email': 'john@example.com'}
)

result = response.json()`,
		update: `# Update a contact
import requests

response = requests.patch('/api/contacts/v1/contacts/update',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'email': 'john@example.com',
    'firstName': 'John',
    'lastName': 'Smith'
  }
)

result = response.json()`,
	},
	php: {
		add: `<?php
// Add a new contact
$data = [
    'email' => 'john@example.com',
    'firstName' => 'John',
    'lastName' => 'Doe',
    'metadata' => ['source' => 'website']
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/contacts/add');
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
// List all contacts
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/contacts/list?page=1&limit=10');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$contacts = curl_exec($ch);
curl_close($ch);
?>`,
		delete: `<?php
// Delete a contact
$data = ['email' => 'john@example.com'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/contacts/delete');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);
?>`,
		update: `<?php
// Update a contact
$data = [
    'email' => 'john@example.com',
    'firstName' => 'John',
    'lastName' => 'Smith'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/contacts/v1/contacts/update');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
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
		label: "Add Contact",
		method: "POST",
		endpoint: "/api/contacts/v1/contacts/add",
	},
	{
		id: "list",
		label: "List Contacts",
		method: "GET",
		endpoint: "/api/contacts/v1/contacts/list",
	},
	{
		id: "update",
		label: "Update Contact",
		method: "PATCH",
		endpoint: "/api/contacts/v1/contacts/update",
	},
	{
		id: "delete",
		label: "Delete Contact",
		method: "DELETE",
		endpoint: "/api/contacts/v1/contacts/delete",
	},
];

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type Language = keyof typeof codeExamples;
type Operation = "add" | "list" | "update" | "delete";

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

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ContactsApiDetails = (props: ButtonProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOperation, setSelectedOperation] = useState<Operation>("add");
	const [selectedLanguage, setSelectedLanguage] =
		useState<Language>("javascript");
	const [copied, setCopied] = useState(false);
	const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
	const [baseCopied, setBaseCopied] = useState(false);

	useHotkeys("a", (e) => {
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
		} catch {
			toast.error("Failed to copy code snippet");
		}
	}, [selectedLanguage, selectedOperation]);

	const copyBaseUrl = useCallback(async () => {
		try {
			await navigator.clipboard.writeText("https://api.reloop.sh");
			setBaseCopied(true);
			setTimeout(() => setBaseCopied(false), 2000);
		} catch {
			toast.error("Failed to copy Base URL");
		}
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
						<p className="font-medium text-label-sm">Contacts API</p>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<Drawer.Content className="max-w-[560px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Contacts API</Drawer.Title>
						<p className="text-sm text-text-sub-600">
							Manage contacts programmatically with our REST API.
						</p>
					</div>
				</Drawer.Header>
				
				<Drawer.Body className="flex flex-col gap-6 p-6">
					{/* Base URL */}
					<div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={copyBaseUrl} role="button" tabIndex={0}>
						<span className="text-xs text-text-sub-500 font-medium">
							Base URL:
						</span>
						<code className="text-xs font-medium text-text-strong-950 group-hover:text-text-sub-600 transition-colors ml-1">
							https://api.reloop.sh
						</code>
						<Icon 
							name={baseCopied ? "check" : "copy"} 
							className={cn(
								"h-3.5 w-3.5 ml-1 transition-colors", 
								baseCopied ? "text-success-base" : "text-text-sub-400 group-hover:text-text-strong-950"
							)} 
						/>
					</div>

					{/* Operations List */}
					<div className="flex flex-col gap-2">
						<h3 className="text-[11px] font-medium uppercase tracking-widest text-text-sub-500 mb-0.5">Endpoints</h3>
						<div className="flex flex-col gap-0.5">
							{operations.map((op) => {
								const isSelected = selectedOperation === op.id;
								return (
									<div
										role="button"
										tabIndex={0}
										key={op.id}
										onClick={() => setSelectedOperation(op.id as Operation)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setSelectedOperation(op.id as Operation);
											}
										}}
										className={cn(
											"group flex items-center gap-4 rounded-md px-2.5 py-1.5 transition-all outline-none border border-transparent cursor-pointer",
											isSelected
												? "bg-bg-white-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
												: "hover:bg-bg-white-0/40"
										)}
									>
										<Badge.Root
											variant="lighter"
											size="small"
											color={getMethodColor(op.method)}
											className="text-[10px] p-2"
										>
											{op.method.charAt(0).toUpperCase() + op.method.slice(1).toLowerCase()}
										</Badge.Root>
										<div className="flex flex-1 items-center justify-between gap-4 min-w-0">
											<div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
												<span className={cn(
													"text-xs font-medium transition-colors truncate",
													isSelected ? "text-text-strong-950" : "text-text-sub-600 group-hover:text-text-strong-950"
												)}>
													{op.label}
												</span>
												<button
													type="button"
													aria-label="View documentation"
													onClick={(e) => {
														e.stopPropagation();
														window.open(`https://docs.reloop.sh/api-reference/contacts#${op.id}`, "_blank");
													}}
													className="p-1 text-text-sub-400 hover:text-text-strong-950 focus:text-text-strong-950 outline-none rounded transition-colors"
												>
													<Icon name="external-link" className="w-[12px] h-[12px]" />
												</button>
											</div>
											<div className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
												<code className={cn(
													"font-mono text-[11px] transition-colors truncate",
													isSelected ? "text-text-sub-500" : "text-text-sub-400 group-hover:text-text-sub-500"
												)}>
													{op.endpoint}
												</code>
												<button
													type="button"
													aria-label="Copy endpoint"
													onClick={async (e) => {
														e.stopPropagation();
														try {
															await navigator.clipboard.writeText(op.endpoint);
															setCopiedEndpoint(op.id);
															setTimeout(() => setCopiedEndpoint(null), 2000);
														} catch {
															toast.error("Failed to copy endpoint");
														}
													}}
													className="p-1 text-text-sub-400 hover:text-text-strong-950 focus:text-text-strong-950 outline-none rounded transition-colors"
												>
													<Icon 
														name={copiedEndpoint === op.id ? "check" : "copy"} 
														className={cn("h-3.5 w-3.5", copiedEndpoint === op.id ? "text-success-base" : "")} 
													/>
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Snippet Block */}
					{currentOperation && (
						<div className="flex flex-col gap-3 pb-6">
							<TabMenuHorizontal.Root
								value={selectedLanguage}
								onValueChange={(val) => setSelectedLanguage(val as Language)}
							>
								<TabMenuHorizontal.List className="border-stroke-soft-200 border-b h-9 gap-4">
									{languages.map((lang) => (
										<TabMenuHorizontal.Trigger
											key={lang.id}
											value={lang.id}
											className="h-9 py-0 text-xs font-medium text-text-sub-500 data-[state=active]:text-text-strong-950"
										>
											{lang.label}
										</TabMenuHorizontal.Trigger>
									))}
								</TabMenuHorizontal.List>
							</TabMenuHorizontal.Root>
							
							<div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 shadow-sm mt-1">
							<div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
								<Button.Root
									type="button"
									variant="neutral"
									size="xsmall"
									mode="ghost"
									onClick={() => toast("Test request feature unavailable", { description: `Cannot currently execute ${currentOperation.method} ${currentOperation.endpoint}` })}
									className="h-8 w-8 aspect-square p-0 bg-bg-white-0/50 backdrop-blur-sm shadow-sm transition-all hover:bg-bg-white-0"
									aria-label="Send test request"
								>
									<Icon name="send" className="h-4 w-4 text-text-sub-600" />
								</Button.Root>
								<Button.Root
									type="button"
									variant="neutral"
									size="xsmall"
									mode="ghost"
									onClick={copyToClipboard}
									className="h-8 w-8 aspect-square p-0 bg-bg-white-0/50 backdrop-blur-sm shadow-sm transition-all hover:bg-bg-white-0"
									aria-label="Copy snippet"
								>
									<Icon
										name={copied ? "check" : "copy"}
										className={cn("h-4 w-4", copied ? "text-success-base" : "text-text-sub-600")}
									/>
								</Button.Root>
							</div>
								<div className="group">
									<CodeBlock
										code={codeExamples[selectedLanguage][selectedOperation]}
										lang={currentLanguageConfig?.shikiLang || "javascript"}
										className="text-[10px] leading-snug sm:text-[11px] sm:leading-relaxed [&>pre]:!m-0 [&>pre]:!p-3"
									/>
								</div>
							</div>
						</div>
					)}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
