import * as Button from "@reloop/ui/button";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { useState } from "react";

const codeExamples = {
	javascript: {
		add: `// Add a new domain
const response = await fetch('/api/v1/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    domain: 'example.com',
    serverIP: '192.168.1.100',
    adminEmail: 'admin@example.com',
    adminPassword: 'securepassword123',
    adminFullName: 'Admin User',
    mailboxes: 100,
    mailboxQuota: 10737418240, // 10GB
    quota: 21474836480, // 20GB
    rateLimit: 20
  })
});

const result = await response.json();
// Handle the result as needed`,
		list: `// List all domains
const response = await fetch('/api/v1/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domains = await response.json();
// Handle the domains data as needed`,
		delete: `// Delete a domain
const response = await fetch('/api/v1/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    domain: 'example.com'
  })
});

const result = await response.json();
// Handle the result as needed`,
		details: `// Get domain details
const response = await fetch('/api/v1/details?domain=example.com', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domainDetails = await response.json();
// Handle the domain details as needed`,
	},
	python: {
		add: `# Add a new domain
import requests

response = requests.post('/api/v1/add',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={
    'domain': 'example.com',
    'serverIP': '192.168.1.100',
    'adminEmail': 'admin@example.com',
    'adminPassword': 'securepassword123',
    'adminFullName': 'Admin User',
    'mailboxes': 100,
    'mailboxQuota': 10737418240,  # 10GB
    'quota': 21474836480,  # 20GB
    'rateLimit': 20
  }
)

result = response.json()
print(result)`,
		list: `# List all domains
import requests

response = requests.get('/api/v1/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domains = response.json()
print(domains)`,
		delete: `# Delete a domain
import requests

response = requests.delete('/api/v1/delete',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={'domain': 'example.com'}
)

result = response.json()
print(result)`,
		details: `# Get domain details
import requests

response = requests.get('/api/v1/details?domain=example.com',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domain_details = response.json()
print(domain_details)`,
	},
	php: {
		add: `<?php
// Add a new domain
$data = [
    'domain' => 'example.com',
    'serverIP' => '192.168.1.100',
    'adminEmail' => 'admin@example.com',
    'adminPassword' => 'securepassword123',
    'adminFullName' => 'Admin User',
    'mailboxes' => 100,
    'mailboxQuota' => 10737418240, // 10GB
    'quota' => 21474836480, // 20GB
    'rateLimit' => 20
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/add');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>`,
		list: `<?php
// List all domains
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/list?page=1&limit=10');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$domains = curl_exec($ch);
curl_close($ch);

echo $domains;
?>`,
		delete: `<?php
// Delete a domain
$data = ['domain' => 'example.com'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/delete');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>`,
		details: `<?php
// Get domain details
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/details?domain=example.com');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$domainDetails = curl_exec($ch);
curl_close($ch);

echo $domainDetails;
?>`,
	},
};

const operations = [
	{
		id: "add",
		label: "Add Domain",
		description: "Create a new domain with DKIM keys and DNS records",
	},
	{
		id: "list",
		label: "List Domains",
		description: "Retrieve all domains with pagination",
	},
	{
		id: "delete",
		label: "Delete Domain",
		description: "Remove a domain and all associated data",
	},
	{
		id: "details",
		label: "Domain Details",
		description: "Get detailed information about a specific domain",
	},
];

const languages = [
	{ id: "javascript", label: "JavaScript", icon: "code" },
	{ id: "python", label: "Python", icon: "code" },
	{ id: "php", label: "PHP", icon: "code" },
];

type Language = keyof typeof codeExamples;
type Operation = "add" | "list" | "delete" | "details";

export const DomainSDK = () => {
	const [selectedOperation, setSelectedOperation] = useState<Operation>("add");
	const [selectedLanguage, setSelectedLanguage] =
		useState<Language>("javascript");

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {}
	};

	return (
		<Drawer.Root>
			<Drawer.Trigger asChild>
				<Button.Root variant="neutral" size="xsmall" mode="stroke">
					<Icon name="code" className="h-4 w-4" />
					API <Kbd.Root>P</Kbd.Root>
				</Button.Root>
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Domain SDK</Drawer.Title>
				</Drawer.Header>
				<Drawer.Body className="p-5">
					<div className="space-y-6">
						<div>
							<h3 className="mb-3 text-label-md text-text-strong-950">
								Language
							</h3>
							<div className="flex gap-2">
								{languages.map((lang) => (
									<Button.Root
										key={lang.id}
										variant={
											selectedLanguage === lang.id ? "primary" : "neutral"
										}
										size="small"
										mode="stroke"
										onClick={() =>
											setSelectedLanguage(lang.id as keyof typeof codeExamples)
										}
									>
										<Icon name={lang.icon} className="h-4 w-4" />
										{lang.label}
									</Button.Root>
								))}
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-label-md text-text-strong-950">
								Operations
							</h3>
							<div className="grid grid-cols-2 gap-2">
								{operations.map((op) => (
									<Button.Root
										key={op.id}
										variant={
											selectedOperation === op.id ? "primary" : "neutral"
										}
										size="small"
										mode="stroke"
										className="flex h-auto flex-col items-start p-3"
										onClick={() => setSelectedOperation(op.id as Operation)}
									>
										<span className="font-medium text-label-sm">
											{op.label}
										</span>
										<span className="mt-1 text-label-xs text-text-sub-600">
											{op.description}
										</span>
									</Button.Root>
								))}
							</div>
						</div>

						<div>
							<div className="mb-3 flex items-center justify-between">
								<h3 className="text-label-md text-text-strong-950">
									Code Example
								</h3>
								<Button.Root
									variant="neutral"
									size="small"
									onClick={() =>
										copyToClipboard(
											codeExamples[selectedLanguage][selectedOperation],
										)
									}
								>
									<Icon name="clipboard-copy" className="h-4 w-4" />
									Copy
								</Button.Root>
							</div>
							<div className="rounded-lg border border-stroke-soft-200 bg-neutral-alpha-50 p-4">
								<pre className="overflow-x-auto whitespace-pre-wrap text-label-sm text-text-strong-950">
									<code>
										{codeExamples[selectedLanguage][selectedOperation]}
									</code>
								</pre>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-label-md text-text-strong-950">
								API Endpoints
							</h3>
							<div className="space-y-2">
								<div className="flex items-center gap-2 rounded-lg bg-neutral-alpha-50 p-3">
									<span className="rounded bg-green-100 px-2 py-1 font-mono text-green-800 text-label-xs">
										POST
									</span>
									<span className="font-mono text-label-sm">/api/v1/add</span>
									<span className="text-label-xs text-text-sub-600">
										Add domain
									</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg bg-neutral-alpha-50 p-3">
									<span className="rounded bg-blue-100 px-2 py-1 font-mono text-blue-800 text-label-xs">
										GET
									</span>
									<span className="font-mono text-label-sm">/api/v1/list</span>
									<span className="text-label-xs text-text-sub-600">
										List domains
									</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg bg-neutral-alpha-50 p-3">
									<span className="rounded bg-red-100 px-2 py-1 font-mono text-label-xs text-red-800">
										DELETE
									</span>
									<span className="font-mono text-label-sm">
										/api/v1/delete
									</span>
									<span className="text-label-xs text-text-sub-600">
										Delete domain
									</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg bg-neutral-alpha-50 p-3">
									<span className="rounded bg-blue-100 px-2 py-1 font-mono text-blue-800 text-label-xs">
										GET
									</span>
									<span className="font-mono text-label-sm">
										/api/v1/details
									</span>
									<span className="text-label-xs text-text-sub-600">
										Get domain details
									</span>
								</div>
							</div>
						</div>
					</div>
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
