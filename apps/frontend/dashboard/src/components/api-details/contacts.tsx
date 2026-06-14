import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	siCurl,
	siDotnet,
	siGo,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { toast } from "sonner";

const langIcons: Record<string, { path: string; hex: string }> = {
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
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

const { data, error } = await reloop.contacts.create({
  email:      'john@example.com',
  firstName:  'John',
  lastName:   'Doe',
  subscribed: false,
  metadata:   { source: 'website' },
});`,
		},
		get: {
			filename: "get_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

// Get by contact id
await reloop.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');

// Get by email
await reloop.contacts.get({ email: 'john@example.com' });`,
		},
		list: {
			filename: "list_contacts.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

const { data } = await reloop.contacts.list({
  page: 1,
  limit: undefined,
});`,
		},
		update: {
			filename: "update_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

const { data, error } = await reloop.contacts.update(
  '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  {
    firstName:  'Steve',
    subscribed: true,
  }
);`,
		},
		delete: {
			filename: "delete_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

await reloop.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');`,
		},
	},
	python: {
		add: {
			filename: "add_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop('re_xxxxxxxx')

data, error = reloop.contacts.create(
    email='john@example.com',
    first_name='John',
    last_name='Doe',
    subscribed=False,
    metadata={'source': 'website'},
)`,
		},
		get: {
			filename: "get_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop('re_xxxxxxxx')

# Get by contact id
reloop.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')

# Get by email
reloop.contacts.get(email='john@example.com')`,
		},
		list: {
			filename: "list_contacts.py",
			code: `from reloop_email import Reloop

reloop = Reloop('re_xxxxxxxx')

data = reloop.contacts.list(
    page=1,
    limit=None,
)`,
		},
		update: {
			filename: "update_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop('re_xxxxxxxx')

data, error = reloop.contacts.update(
    '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
    first_name='Steve',
    subscribed=True,
)`,
		},
		delete: {
			filename: "delete_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop('re_xxxxxxxx')

reloop.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')`,
		},
	},
	php: {
		add: {
			filename: "add_contact.php",
			code: `$reloop = Reloop::client('re_xxxxxxxx');

$reloop->contacts->create(
  parameters: [
    'email' => 'john@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'unsubscribed' => false,
  ],
);`,
		},
		get: {
			filename: "get_contact.php",
			code: `$reloop = Reloop::client('re_xxxxxxxx');

$reloop->contacts->get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');`,
		},
		list: {
			filename: "list_contacts.php",
			code: `$reloop = Reloop::client('re_xxxxxxxx');

$reloop->contacts->list(
  options: [
    'page' => 1,
    'limit' => 10,
  ],
);`,
		},
		update: {
			filename: "update_contact.php",
			code: `$reloop = Reloop::client('re_xxxxxxxx');

$reloop->contacts->update(
  '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  parameters: [
    'first_name' => 'Steve',
    'unsubscribed' => false,
  ],
);`,
		},
		delete: {
			filename: "delete_contact.php",
			code: `$reloop = Reloop::client('re_xxxxxxxx');

$reloop->contacts->delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d');`,
		},
	},
	go: {
		add: {
			filename: "add_contact.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    result, err := reloop.Contacts().Create(&reloopemail.CreateContactParams{
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

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    // Get by contact id
    reloop.Contacts().Get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

    // Get by email
    reloop.Contacts().GetByEmail("john@example.com")
}`,
		},
		list: {
			filename: "list_contacts.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    data, err := reloop.Contacts().List(&reloopemail.ListParams{
        Page:  1,
        Limit: nil,
    })
}`,
		},
		update: {
			filename: "update_contact.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    result, err := reloop.Contacts().Update(
        "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
        &reloopemail.UpdateContactParams{
            FirstName:  "Steve",
            Subscribed: true,
        },
    )
}`,
		},
		delete: {
			filename: "delete_contact.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    reloop.Contacts().Delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")
}`,
		},
	},
	ruby: {
		add: {
			filename: "add_contact.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

result = reloop.contacts.create(
  email:      'john@example.com',
  first_name: 'John',
  last_name:  'Doe',
  subscribed: false,
  metadata:   { source: 'website' }
)`,
		},
		get: {
			filename: "get_contact.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

# Get by contact id
reloop.contacts.get('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')

# Get by email
reloop.contacts.get(email: 'john@example.com')`,
		},
		list: {
			filename: "list_contacts.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

data = reloop.contacts.list(
  page:  1,
  limit: nil
)`,
		},
		update: {
			filename: "update_contact.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

result = reloop.contacts.update(
  '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d',
  first_name: 'Steve',
  subscribed: true
)`,
		},
		delete: {
			filename: "delete_contact.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

reloop.contacts.delete('5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d')`,
		},
	},
	rust: {
		add: {
			filename: "add_contact.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

let result = reloop.contacts().create(
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
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

// Get by contact id
reloop.contacts().get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d").await?;

// Get by email
reloop.contacts().get_by_email("john@example.com").await?;`,
		},
		list: {
			filename: "list_contacts.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

let data = reloop.contacts().list(
    ListParams::builder()
        .page(1)
        .build(),
).await?;`,
		},
		update: {
			filename: "update_contact.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

let result = reloop.contacts().update(
    "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    UpdateContactParams::builder()
        .first_name("Steve")
        .subscribed(true)
        .build(),
).await?;`,
		},
		delete: {
			filename: "delete_contact.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

reloop.contacts().delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d").await?;`,
		},
	},
	java: {
		add: {
			filename: "AddContact.java",
			code: `import sh.reloop.email.ReloopEmail;
import sh.reloop.email.models.Contact;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

Contact contact = reloop.contacts().create(
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
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

// Get by contact id
reloop.contacts().get("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");

// Get by email
reloop.contacts().getByEmail("john@example.com");`,
		},
		list: {
			filename: "ListContacts.java",
			code: `import sh.reloop.email.ReloopEmail;
import sh.reloop.email.models.ContactList;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

ContactList data = reloop.contacts().list(
    ListParams.builder()
        .page(1)
        .build()
);`,
		},
		update: {
			filename: "UpdateContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

reloop.contacts().update(
    "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    UpdateContactParams.builder()
        .firstName("Steve")
        .subscribed(true)
        .build()
);`,
		},
		delete: {
			filename: "DeleteContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

reloop.contacts().delete("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");`,
		},
	},
	dotnet: {
		add: {
			filename: "AddContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

var contact = await reloop.Contacts.CreateAsync(new CreateContactParams
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
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

// Get by contact id
await reloop.Contacts.GetAsync("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");

// Get by email
await reloop.Contacts.GetByEmailAsync("john@example.com");`,
		},
		list: {
			filename: "ListContacts.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

var data = await reloop.Contacts.ListAsync(new ListParams
{
    Page  = 1,
    Limit = null
});`,
		},
		update: {
			filename: "UpdateContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

await reloop.Contacts.UpdateAsync(
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
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

await reloop.Contacts.DeleteAsync("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");`,
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
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<Language>(
		languages.map((l) => l.id),
		"nodejs",
	);

	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const isFirstScrollRef = useRef(true);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = languages.findIndex((l) => l.id === selectedLanguage);

	useEffect(() => {
		if (!mounted) return;
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const activeBtn = tabButtonRefs.current[activeTabIndex];
			if (activeBtn && container.clientWidth > 0) {
				const containerLeft = container.scrollLeft;
				const containerWidth = container.clientWidth;
				const containerRight = containerLeft + containerWidth;

				const btnLeft = activeBtn.offsetLeft;
				const btnWidth = activeBtn.offsetWidth;
				const btnRight = btnLeft + btnWidth;

				if (btnLeft < containerLeft || btnRight > containerRight) {
					const targetScrollLeft =
						btnLeft < containerLeft
							? btnLeft - 16
							: btnRight - containerWidth + 16;

					container.scrollTo({
						left: Math.max(0, targetScrollLeft),
						behavior: isFirstScrollRef.current ? "auto" : "smooth",
					});
				}
				isFirstScrollRef.current = false;
			}
		};

		handleScroll();

		const observer = new ResizeObserver(() => {
			handleScroll();
		});
		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [activeTabIndex, mounted]);

	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedTab = tabButtonRefs.current[highlightedTabIndex];
	const highlightedBrandColor =
		highlightedTabIndex >= 0 && languages[highlightedTabIndex]?.id
			? `#${langIcons[languages[highlightedTabIndex].id]?.hex}`
			: undefined;

	const getTabPosition = (button: HTMLButtonElement | null | undefined) => {
		if (!button) return null;

		return {
			width: button.offsetWidth,
			height: button.offsetHeight,
			left: button.offsetLeft,
			top: button.offsetTop,
		};
	};

	const pillInset = { x: 6, y: 6 };
	const getPillPosition = (position: ReturnType<typeof getTabPosition>) => {
		if (!position) return null;

		return {
			width: position.width - pillInset.x * 2,
			height: position.height - pillInset.y * 2 - 2,
			left: position.left + pillInset.x,
			top: position.top + pillInset.y,
		};
	};

	const highlightedTabPosition = mounted
		? getTabPosition(highlightedTab)
		: null;
	const highlightedPillPosition = getPillPosition(highlightedTabPosition);

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
				<Drawer.Header
					className="border-stroke-soft-200 border-b"
					showCloseButton={false}
				>
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Contacts API</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Create, retrieve, update, and delete contacts programmatically.
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
				<Drawer.Body className="flex flex-col gap-8">
					<style>{`
						.scrollbar-none::-webkit-scrollbar {
							display: none;
						}
					`}</style>

					{/* Language Tabs */}
					<div
						ref={containerRef}
						className="scrollbar-none relative flex min-w-0 items-center overflow-x-auto px-6"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{languages.map((lang, index) => {
							const icon = langIcons[lang.id];
							const isActive = selectedLanguage === lang.id;
							const brandColor = icon ? `#${icon.hex}` : undefined;
							const isHighlighted = index === highlightedTabIndex;

							let textColorStyle: React.CSSProperties | undefined = undefined;
							if (isHighlighted) {
								textColorStyle = { color: "#ffffff" };
							} else if (isActive && brandColor) {
								textColorStyle = { color: brandColor };
							}

							return (
								<button
									key={lang.id}
									ref={(el) => {
										tabButtonRefs.current[index] = el;
									}}
									type="button"
									onClick={() => setSelectedLanguage(lang.id)}
									onPointerEnter={() => setHoveredTabIdx(index)}
									onPointerLeave={() => setHoveredTabIdx(undefined)}
									className={cn(
										"relative z-10 flex shrink-0 items-center gap-2 px-4 py-3 font-medium text-[17px] transition-colors duration-150",
										isActive
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 dark:text-white/70",
									)}
									style={textColorStyle}
								>
									{icon && (
										<svg
											role="img"
											viewBox="0 0 24 24"
											className="size-3.5 shrink-0 transition-colors duration-150"
											fill="currentColor"
											xmlns="http://www.w3.org/2000/svg"
											style={{ color: isHighlighted ? "#ffffff" : brandColor }}
											aria-hidden
										>
											<path d={icon.path} />
										</svg>
									)}
									{lang.label}
								</button>
							);
						})}
						<AnimatePresence>
							{highlightedPillPosition && highlightedTabIndex !== -1 ? (
								<motion.div
									className="pointer-events-none absolute top-0 left-0 rounded-full"
									style={{
										backgroundColor: highlightedBrandColor || undefined,
									}}
									initial={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									animate={{
										...highlightedPillPosition,
										opacity: 1,
									}}
									exit={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</div>

					{operations.map((op) => {
						const example =
							codeExamples[selectedLanguage][
								op.id as keyof (typeof codeExamples)[Language]
							];

						return (
							<section key={op.id} className="px-6">
								<CopyCodeBlock
									code={example.code}
									lang={currentLanguageConfig?.shikiLang || "javascript"}
									label={example.filename}
									title={op.label}
									titleHref={`https://docs.reloop.sh/api-reference/contacts#${op.id}`}
								/>
							</section>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
