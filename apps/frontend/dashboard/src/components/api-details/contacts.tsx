import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import {
	siNodedotjs,
	siRuby,
	siPhp,
	siPython,
	siGo,
	siRust,
	siOpenjdk,
	siDotnet,
	siCurl,
} from "simple-icons";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

const langIcons: Record<string, { svg: string }> = {
	nodejs: siNodedotjs,
	ruby: siRuby,
	php: siPhp,
	python: siPython,
	go: siGo,
	rust: siRust,
	java: siOpenjdk,
	dotnet: siDotnet,
	curl: siCurl,
};

// ---------------------------------------------------------------------------
// SDK-style code examples per language × operation
// ---------------------------------------------------------------------------

const codeExamples = {
	nodejs: {
		add: {
			filename: "add_contact.js",
			code: `import { ReloopClient } from 'reloop';

const client = new ReloopClient('re_xxxxxxxx');

const { data, error } = await client.contacts.create({
  email:      'john@example.com',
  firstName:  'John',
  lastName:   'Doe',
  subscribed: false,
  metadata:   { source: 'website' },
});`,
		},
		get: {
			filename: "get_contact.js",
			code: `import { ReloopClient } from 'reloop';

const client = new ReloopClient('re_xxxxxxxx');

// Get by contact id
await client.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');

// Get by email
await client.contacts.get({ email: 'john@example.com' });`,
		},
		list: {
			filename: "list_contacts.js",
			code: `import { ReloopClient } from 'reloop';

const client = new ReloopClient('re_xxxxxxxx');

const { data } = await client.contacts.list({
  page: 1,
  limit: undefined,
});`,
		},
		update: {
			filename: "update_contact.js",
			code: `import { ReloopClient } from 'reloop';

const client = new ReloopClient('re_xxxxxxxx');

const { data, error } = await client.contacts.update(
  '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  {
    firstName:  'Steve',
    subscribed: true,
  }
);`,
		},
		delete: {
			filename: "delete_contact.js",
			code: `import { ReloopClient } from 'reloop';

const client = new ReloopClient('re_xxxxxxxx');

await client.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');`,
		},
	},
	python: {
		add: {
			filename: "add_contact.py",
			code: `from reloop import ReloopClient

client = ReloopClient('re_xxxxxxxx')

data, error = client.contacts.create(
    email='john@example.com',
    first_name='John',
    last_name='Doe',
    subscribed=False,
    metadata={'source': 'website'},
)`,
		},
		get: {
			filename: "get_contact.py",
			code: `from reloop import ReloopClient

client = ReloopClient('re_xxxxxxxx')

# Get by contact id
client.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')

# Get by email
client.contacts.get(email='john@example.com')`,
		},
		list: {
			filename: "list_contacts.py",
			code: `from reloop import ReloopClient

client = ReloopClient('re_xxxxxxxx')

data = client.contacts.list(
    page=1,
    limit=None,
)`,
		},
		update: {
			filename: "update_contact.py",
			code: `from reloop import ReloopClient

client = ReloopClient('re_xxxxxxxx')

data, error = client.contacts.update(
    '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
    first_name='Steve',
    subscribed=True,
)`,
		},
		delete: {
			filename: "delete_contact.py",
			code: `from reloop import ReloopClient

client = ReloopClient('re_xxxxxxxx')

client.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')`,
		},
	},
	php: {
		add: {
			filename: "add_contact.php",
			code: `<?php
use Reloop\\ReloopClient;

$client = new ReloopClient('re_xxxxxxxx');

$result = $client->contacts->create([
    'email'      => 'john@example.com',
    'firstName'  => 'John',
    'lastName'   => 'Doe',
    'subscribed' => false,
    'metadata'   => ['source' => 'website'],
]);`,
		},
		get: {
			filename: "get_contact.php",
			code: `<?php
use Reloop\\ReloopClient;

$client = new ReloopClient('re_xxxxxxxx');

// Get by contact id
$client->contacts->get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');

// Get by email
$client->contacts->get(['email' => 'john@example.com']);`,
		},
		list: {
			filename: "list_contacts.php",
			code: `<?php
use Reloop\\ReloopClient;

$client = new ReloopClient('re_xxxxxxxx');

$data = $client->contacts->list([
    'page'  => 1,
    'limit' => null,
]);`,
		},
		update: {
			filename: "update_contact.php",
			code: `<?php
use Reloop\\ReloopClient;

$client = new ReloopClient('re_xxxxxxxx');

$result = $client->contacts->update(
    '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
    [
        'firstName'  => 'Steve',
        'subscribed' => true,
    ]
);`,
		},
		delete: {
			filename: "delete_contact.php",
			code: `<?php
use Reloop\\ReloopClient;

$client = new ReloopClient('re_xxxxxxxx');

$client->contacts->delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');`,
		},
	},
	go: {
		add: {
			filename: "add_contact.go",
			code: `package main

import "github.com/reloop-labs/reloop-go"

func main() {
    client := reloop.NewClient("re_xxxxxxxx")

    result, err := client.Contacts.Create(&reloop.CreateContactParams{
        Email:      "john@example.com",
        FirstName:  "John",
        LastName:   "Doe",
        Subscribed: false,
        Metadata:   map[string]string{"source": "website"},
    })
}`,
		},
		get: {
			filename: "get_contact.go",
			code: `package main

import "github.com/reloop-labs/reloop-go"

func main() {
    client := reloop.NewClient("re_xxxxxxxx")

    // Get by contact id
    client.Contacts.Get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

    // Get by email
    client.Contacts.GetByEmail("john@example.com")
}`,
		},
		list: {
			filename: "list_contacts.go",
			code: `package main

import "github.com/reloop-labs/reloop-go"

func main() {
    client := reloop.NewClient("re_xxxxxxxx")

    data, err := client.Contacts.List(&reloop.ListParams{
        Page:  1,
        Limit: nil,
    })
}`,
		},
		update: {
			filename: "update_contact.go",
			code: `package main

import "github.com/reloop-labs/reloop-go"

func main() {
    client := reloop.NewClient("re_xxxxxxxx")

    result, err := client.Contacts.Update(
        "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
        &reloop.UpdateContactParams{
            FirstName:  "Steve",
            Subscribed: true,
        },
    )
}`,
		},
		delete: {
			filename: "delete_contact.go",
			code: `package main

import "github.com/reloop-labs/reloop-go"

func main() {
    client := reloop.NewClient("re_xxxxxxxx")

    client.Contacts.Delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")
}`,
		},
	},
	ruby: {
		add: {
			filename: "add_contact.rb",
			code: `require 'reloop'

client = Reloop::Client.new('re_xxxxxxxx')

result = client.contacts.create(
  email:      'john@example.com',
  first_name: 'John',
  last_name:  'Doe',
  subscribed: false,
  metadata:   { source: 'website' }
)`,
		},
		get: {
			filename: "get_contact.rb",
			code: `require 'reloop'

client = Reloop::Client.new('re_xxxxxxxx')

# Get by contact id
client.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')

# Get by email
client.contacts.get(email: 'john@example.com')`,
		},
		list: {
			filename: "list_contacts.rb",
			code: `require 'reloop'

client = Reloop::Client.new('re_xxxxxxxx')

data = client.contacts.list(
  page:  1,
  limit: nil
)`,
		},
		update: {
			filename: "update_contact.rb",
			code: `require 'reloop'

client = Reloop::Client.new('re_xxxxxxxx')

result = client.contacts.update(
  '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  first_name: 'Steve',
  subscribed: true
)`,
		},
		delete: {
			filename: "delete_contact.rb",
			code: `require 'reloop'

client = Reloop::Client.new('re_xxxxxxxx')

client.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')`,
		},
	},
	rust: {
		add: {
			filename: "add_contact.rs",
			code: `use reloop::ReloopClient;

let client = ReloopClient::new("re_xxxxxxxx");

let result = client.contacts().create(
    CreateContactParams::builder()
        .email("john@example.com")
        .first_name("John")
        .last_name("Doe")
        .subscribed(false)
        .metadata(json!({ "source": "website" }))
        .build(),
).await?;`,
		},
		get: {
			filename: "get_contact.rs",
			code: `use reloop::ReloopClient;

let client = ReloopClient::new("re_xxxxxxxx");

// Get by contact id
client.contacts().get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d").await?;

// Get by email
client.contacts().get_by_email("john@example.com").await?;`,
		},
		list: {
			filename: "list_contacts.rs",
			code: `use reloop::ReloopClient;

let client = ReloopClient::new("re_xxxxxxxx");

let data = client.contacts().list(
    ListParams::builder()
        .page(1)
        .build(),
).await?;`,
		},
		update: {
			filename: "update_contact.rs",
			code: `use reloop::ReloopClient;

let client = ReloopClient::new("re_xxxxxxxx");

let result = client.contacts().update(
    "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    UpdateContactParams::builder()
        .first_name("Steve")
        .subscribed(true)
        .build(),
).await?;`,
		},
		delete: {
			filename: "delete_contact.rs",
			code: `use reloop::ReloopClient;

let client = ReloopClient::new("re_xxxxxxxx");

client.contacts().delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d").await?;`,
		},
	},
	java: {
		add: {
			filename: "AddContact.java",
			code: `import com.reloop.ReloopClient;
import com.reloop.models.Contact;

ReloopClient client = new ReloopClient("re_xxxxxxxx");

Contact contact = client.contacts().create(
    CreateContactParams.builder()
        .email("john@example.com")
        .firstName("John")
        .lastName("Doe")
        .subscribed(false)
        .metadata(Map.of("source", "website"))
        .build()
);`,
		},
		get: {
			filename: "GetContact.java",
			code: `import com.reloop.ReloopClient;

ReloopClient client = new ReloopClient("re_xxxxxxxx");

// Get by contact id
client.contacts().get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");

// Get by email
client.contacts().getByEmail("john@example.com");`,
		},
		list: {
			filename: "ListContacts.java",
			code: `import com.reloop.ReloopClient;
import com.reloop.models.ContactList;

ReloopClient client = new ReloopClient("re_xxxxxxxx");

ContactList data = client.contacts().list(
    ListParams.builder()
        .page(1)
        .build()
);`,
		},
		update: {
			filename: "UpdateContact.java",
			code: `import com.reloop.ReloopClient;

ReloopClient client = new ReloopClient("re_xxxxxxxx");

client.contacts().update(
    "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    UpdateContactParams.builder()
        .firstName("Steve")
        .subscribed(true)
        .build()
);`,
		},
		delete: {
			filename: "DeleteContact.java",
			code: `import com.reloop.ReloopClient;

ReloopClient client = new ReloopClient("re_xxxxxxxx");

client.contacts().delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");`,
		},
	},
	dotnet: {
		add: {
			filename: "AddContact.cs",
			code: `using Reloop;

var client = new ReloopClient("re_xxxxxxxx");

var contact = await client.Contacts.CreateAsync(new CreateContactParams
{
    Email      = "john@example.com",
    FirstName  = "John",
    LastName   = "Doe",
    Subscribed = false,
    Metadata   = new Dictionary<string, string> { ["source"] = "website" }
});`,
		},
		get: {
			filename: "GetContact.cs",
			code: `using Reloop;

var client = new ReloopClient("re_xxxxxxxx");

// Get by contact id
await client.Contacts.GetAsync("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");

// Get by email
await client.Contacts.GetByEmailAsync("john@example.com");`,
		},
		list: {
			filename: "ListContacts.cs",
			code: `using Reloop;

var client = new ReloopClient("re_xxxxxxxx");

var data = await client.Contacts.ListAsync(new ListParams
{
    Page  = 1,
    Limit = null
});`,
		},
		update: {
			filename: "UpdateContact.cs",
			code: `using Reloop;

var client = new ReloopClient("re_xxxxxxxx");

await client.Contacts.UpdateAsync(
    "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    new UpdateContactParams
    {
        FirstName  = "Steve",
        Subscribed = true
    }
);`,
		},
		delete: {
			filename: "DeleteContact.cs",
			code: `using Reloop;

var client = new ReloopClient("re_xxxxxxxx");

await client.Contacts.DeleteAsync("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");`,
		},
	},
	curl: {
		add: {
			filename: "add_contact.sh",
			code: `curl -X POST https://api.reloop.sh/api/contacts/v1/contacts/add \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer re_xxxxxxxx" \\
  -d '{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "subscribed": false,
    "metadata": { "source": "website" }
  }'`,
		},
		get: {
			filename: "get_contact.sh",
			code: `# Get by contact id
curl https://api.reloop.sh/api/contacts/v1/contacts/5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d \\
  -H "Authorization: Bearer re_xxxxxxxx"

# Get by email
curl "https://api.reloop.sh/api/contacts/v1/contacts?email=john@example.com" \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
		list: {
			filename: "list_contacts.sh",
			code: `curl "https://api.reloop.sh/api/contacts/v1/contacts/list?page=1&limit=10" \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
		update: {
			filename: "update_contact.sh",
			code: `curl -X PATCH https://api.reloop.sh/api/contacts/v1/contacts/update \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer re_xxxxxxxx" \\
  -d '{
    "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    "firstName": "Steve",
    "subscribed": true
  }'`,
		},
		delete: {
			filename: "delete_contact.sh",
			code: `curl -X DELETE https://api.reloop.sh/api/contacts/v1/contacts/delete \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer re_xxxxxxxx" \\
  -d '{ "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d" }'`,
		},
	},
};

// ---------------------------------------------------------------------------
// Operations – all shown at once in a scrollable list
// ---------------------------------------------------------------------------

const operations = [
	{ id: "add", label: "Add Contact" },
	{ id: "get", label: "Get Contact" },
	{ id: "list", label: "List Contacts" },
	{ id: "update", label: "Update Contact" },
	{ id: "delete", label: "Delete Contact" },
] as const;

const languages = [
	{ id: "nodejs", label: "Node.js", shikiLang: "javascript" },
	{ id: "ruby", label: "Ruby", shikiLang: "ruby" },
	{ id: "php", label: "PHP", shikiLang: "php" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "go", label: "Go", shikiLang: "go" },
	{ id: "rust", label: "Rust", shikiLang: "rust" },
	{ id: "java", label: "Java", shikiLang: "java" },
	{ id: "dotnet", label: ".NET", shikiLang: "csharp" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

type Language = keyof typeof codeExamples;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ContactsApiDetails = (props: ButtonProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] =
		useState<Language>("nodejs");
	const [baseCopied, setBaseCopied] = useState(false);
	const [copiedOp, setCopiedOp] = useState<string | null>(null);

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

	const copyBaseUrl = useCallback(async () => {
		try {
			await navigator.clipboard.writeText("https://api.reloop.sh");
			setBaseCopied(true);
			setTimeout(() => setBaseCopied(false), 2000);
		} catch {
			toast.error("Failed to copy Base URL");
		}
	}, []);

	const copySnippet = useCallback(
		async (operationId: string) => {
			try {
				const example =
					codeExamples[selectedLanguage][
						operationId as keyof (typeof codeExamples)[Language]
					];
				await navigator.clipboard.writeText(example.code);
				setCopiedOp(operationId);
				setTimeout(() => setCopiedOp(null), 2000);
			} catch {
				toast.error("Failed to copy code snippet");
			}
		},
		[selectedLanguage],
	);

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
				{/* ── Header ─────────────────────────────────────────── */}
				<Drawer.Header className="border-stroke-soft-200 border-b" showCloseButton={false}>
					<div className="flex flex-1 flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<span className="text-[11px] font-medium uppercase tracking-widest text-text-sub-400">
								REST API
							</span>
							<span className="text-[11px] text-text-sub-400">·</span>
							<span className="text-[11px] font-medium uppercase tracking-widest text-text-sub-400">
								V1
							</span>
						</div>
						<Drawer.Title className="text-2xl font-semibold tracking-tight">
							Contacts <span className="font-light italic text-text-sub-600">API</span>
						</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Manage contacts programmatically. Authenticated, structured, predictable.
						</p>
					</div>
					<Drawer.Close asChild>
						<button
							type="button"
							className="self-start rounded-lg border border-stroke-soft-200 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Close"
						>
							<Icon name="cross" className="h-4 w-4" />
						</button>
					</Drawer.Close>
				</Drawer.Header>

				{/* ── Body ────────────────────────────────────────────── */}
				<Drawer.Body className="flex flex-col gap-8 p-6">
					{/* Base URL */}
					<div className="flex items-center gap-3">
						<span className="text-[11px] font-medium uppercase tracking-wider text-text-sub-400 flex-shrink-0">
							Base URL
						</span>
						<code className="font-mono text-[13px] text-text-strong-950">
							https://api.reloop.sh
						</code>
						<button
							type="button"
							onClick={copyBaseUrl}
							className="p-1 rounded-md text-text-sub-400 hover:text-text-strong-950 hover:bg-bg-weak-50 transition-colors"
							aria-label="Copy base URL"
						>
							<Icon
								name={baseCopied ? "check" : "copy"}
								className={cn("h-3.5 w-3.5", baseCopied && "text-success-base")}
							/>
						</button>
					</div>

					{/* Language Pills */}
					<div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
						{languages.map((lang) => {
							const icon = langIcons[lang.id];
							return (
								<button
									type="button"
									key={lang.id}
									onClick={() => setSelectedLanguage(lang.id)}
									className={cn(
										"shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200",
										selectedLanguage === lang.id
											? "border-text-strong-950 bg-text-strong-950 text-static-white shadow-sm"
											: "border-stroke-soft-200 text-text-sub-600 hover:border-stroke-strong-950 hover:text-text-strong-950",
									)}
								>
									{icon && (
										<span
											className="flex h-4 w-4 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5"
											dangerouslySetInnerHTML={{
												__html: icon.svg.replace('<svg', '<svg fill="currentColor"'),
											}}
										/>
									)}
									{lang.label}
								</button>
							);
						})}
					</div>

					{/* ── Endpoint Sections ──────────────────────────── */}
					{operations.map((op) => {
						const example =
							codeExamples[selectedLanguage][
								op.id as keyof (typeof codeExamples)[Language]
							];
						const isCopied = copiedOp === op.id;

						return (
							<section key={op.id} className="flex flex-col gap-3">
								{/* Section title */}
								<div className="flex items-center gap-2">
									<h3 className="text-[15px] font-semibold text-text-strong-950">
										{op.label}
									</h3>
									<button
										type="button"
										onClick={() =>
											window.open(
												`https://docs.reloop.sh/api-reference/contacts#${op.id}`,
												"_blank",
											)
										}
										className="p-0.5 text-text-sub-400 hover:text-text-strong-950 transition-colors rounded"
										aria-label="View documentation"
									>
										<Icon name="external-link" className="h-3.5 w-3.5" />
									</button>
								</div>

								{/* Dark code card */}
								<div className="relative rounded-xl bg-[#1a1a2e] overflow-hidden ring-1 ring-white/[0.06]">
									{/* Filename label */}
									<div className="flex items-center justify-between px-4 pt-3 pb-0">
										<span className="font-mono text-[11px] text-white/40">
											{example.filename}
										</span>
										<button
											type="button"
											onClick={() => copySnippet(op.id)}
											className={cn(
												"rounded-md p-1.5 transition-colors",
												isCopied
													? "text-green-400"
													: "text-white/40 hover:text-white/70 hover:bg-white/[0.06]",
											)}
											aria-label="Copy snippet"
										>
											<Icon
												name={isCopied ? "check" : "copy"}
												className="h-3.5 w-3.5"
											/>
										</button>
									</div>

									{/* Code block */}
									<CodeBlock
										code={example.code}
										lang={currentLanguageConfig?.shikiLang || "javascript"}
										theme="one-dark-pro"
										className="text-[12px] leading-relaxed [&>pre]:!bg-transparent [&>pre]:!py-3 [&>pre]:!px-4 [&_.line]:!pl-0 [&_.line::before]:!hidden"
									/>
								</div>
							</section>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
