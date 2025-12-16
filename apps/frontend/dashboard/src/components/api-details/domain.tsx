import * as Button from "@reloop/ui/button";
import * as Drawer from "@reloop/ui/drawer";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import * as Badge from "@reloop/ui/badge";
import * as Tooltip from "@reloop/ui/tooltip";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { useState, useCallback } from "react";

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

const result = await response.json();`,
        list: `// List all domains
const response = await fetch('/api/v1/list?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domains = await response.json();`,
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

const result = await response.json();`,
        details: `// Get domain details
const response = await fetch('/api/v1/details?domain=example.com', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const domainDetails = await response.json();`,
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
    'mailboxQuota': 10737418240,
    'quota': 21474836480,
    'rateLimit': 20
  }
)

result = response.json()`,
        list: `# List all domains
import requests

response = requests.get('/api/v1/list?page=1&limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domains = response.json()`,
        delete: `# Delete a domain
import requests

response = requests.delete('/api/v1/delete',
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  json={'domain': 'example.com'}
)

result = response.json()`,
        details: `# Get domain details
import requests

response = requests.get('/api/v1/details?domain=example.com',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

domain_details = response.json()`,
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
    'mailboxQuota' => 10737418240,
    'quota' => 21474836480,
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
?>`,
    },
};

const operations = [
    {
        id: "add",
        label: "Add Domain",
        method: "POST",
        endpoint: "/api/v1/add",
    },
    {
        id: "list",
        label: "List Domains",
        method: "GET",
        endpoint: "/api/v1/list",
    },
    {
        id: "delete",
        label: "Delete Domain",
        method: "DELETE",
        endpoint: "/api/v1/delete",
    },
    {
        id: "details",
        label: "Get Details",
        method: "GET",
        endpoint: "/api/v1/details",
    },
];

const languages = [
    { id: "javascript", label: "JavaScript", shikiLang: "javascript" },
    { id: "python", label: "Python", shikiLang: "python" },
    { id: "php", label: "PHP", shikiLang: "php" },
] as const;

type Language = keyof typeof codeExamples;
type Operation = "add" | "list" | "delete" | "details";

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

export const DomainApiDetails = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOperation, setSelectedOperation] = useState<Operation>("add");
    const [selectedLanguage, setSelectedLanguage] = useState<Language>("javascript");
    const [copied, setCopied] = useState(false);

    const currentLanguageConfig = languages.find((l) => l.id === selectedLanguage);
    const currentOperation = operations.find((op) => op.id === selectedOperation);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(
                codeExamples[selectedLanguage][selectedOperation]
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    }, [selectedLanguage, selectedOperation]);

    const copyBaseUrl = useCallback(async () => {
        try {
            await navigator.clipboard.writeText("https://api.reloop.sh");
        } catch { }
    }, []);

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
                    <Kbd.Root className="bg-bg-weak-50 text-[10px]">A</Kbd.Root>
                </Button.Root>
            </Drawer.Trigger>
            <Drawer.Content className="max-w-[480px]">
                <Drawer.Header className="border-b border-stroke-soft-200">
                    <div className="flex flex-1 flex-col gap-1">
                        <Drawer.Title>Domain API</Drawer.Title>
                        <p className="text-paragraph-xs text-text-sub-600">
                            Manage domains programmatically with our REST API
                        </p>
                    </div>
                </Drawer.Header>
                <Drawer.Body className="flex flex-col gap-6 p-5">
                    {/* Base URL Section */}
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
                                        <Icon name="clipboard-copy" className="h-3.5 w-3.5" />
                                    </Button.Root>
                                </Tooltip.Trigger>
                                <Tooltip.Content size="xsmall">Copy base URL</Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>

                    {/* Language Selector - Custom Segmented Control */}
                    <div className="space-y-2.5">
                        <h3 className="text-label-sm text-text-sub-600">Language</h3>
                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-bg-weak-50 p-1">
                            {languages.map((lang) => (
                                <button
                                    type="button"
                                    key={lang.id}
                                    onClick={() => setSelectedLanguage(lang.id)}
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-label-sm font-medium transition-all duration-200",
                                        "text-text-sub-600 hover:text-text-strong-950",
                                        selectedLanguage === lang.id &&
                                        "bg-bg-white-0 text-text-strong-950 shadow-sm"
                                    )}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Operations Tabs */}
                    <div className="space-y-2.5">
                        <h3 className="text-label-sm text-text-sub-600">Operation</h3>
                        <TabMenuHorizontal.Root
                            value={selectedOperation}
                            onValueChange={(value) => setSelectedOperation(value as Operation)}
                        >
                            <TabMenuHorizontal.List className="border-b border-stroke-soft-200">
                                {operations.map((op) => (
                                    <TabMenuHorizontal.Trigger key={op.id} value={op.id}>
                                        {op.label}
                                    </TabMenuHorizontal.Trigger>
                                ))}
                            </TabMenuHorizontal.List>
                        </TabMenuHorizontal.Root>
                    </div>

                    {/* Current Endpoint Display */}
                    {currentOperation && (
                        <div className="flex items-center gap-3">
                            <Badge.Root
                                variant="light"
                                size="medium"
                                color={getMethodColor(currentOperation.method)}
                            >
                                {currentOperation.method}
                            </Badge.Root>
                            <code className="font-mono text-label-sm text-text-strong-950">
                                {currentOperation.endpoint}
                            </code>
                        </div>
                    )}

                    {/* Code Block */}
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
                                    className="h-3.5 w-3.5"
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

                    {/* All Endpoints Reference */}
                    <div className="space-y-2.5">
                        <h3 className="text-label-sm text-text-sub-600">All Endpoints</h3>
                        <div className="divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
                            {operations.map((op) => (
                                <button
                                    type="button"
                                    key={op.id}
                                    onClick={() => setSelectedOperation(op.id as Operation)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-150",
                                        "hover:bg-bg-weak-50",
                                        selectedOperation === op.id && "bg-bg-weak-50"
                                    )}
                                >
                                    <Badge.Root
                                        variant="light"
                                        size="small"
                                        color={getMethodColor(op.method)}
                                        className="w-16 justify-center font-mono"
                                    >
                                        {op.method}
                                    </Badge.Root>
                                    <code className="flex-1 font-mono text-label-xs text-text-strong-950">
                                        {op.endpoint}
                                    </code>
                                    <span className="text-label-xs text-text-sub-600">{op.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Drawer.Body>
            </Drawer.Content>
        </Drawer.Root>
    );
};
