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
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: contact, error } = await reloop.contacts.create({
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  groupIds: ["grp_123456789"],
  channels: [{ channelId: "chn_123456789", subscription: "opt_in" }],
});
if (error) throw error;`,
		},
		get: {
			filename: "get_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: contact, error } = await reloop.contacts().get('cont_123456789');
if (error) throw error;`,
		},
		list: {
			filename: "list_contact.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: contacts, error } = await reloop.contacts.list({
  page: 1,
  limit: 10,
  status: "subscribed",
});
if (error) throw error;`,
		},
		update: {
			filename: "update_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: contact, error } = await reloop.contacts().update('cont_123456789', {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
});
if (error) throw error;`,
		},
		delete: {
			filename: "delete_contact.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response, error } = await reloop.contacts().delete('cont_123456789');
if (error) throw error;`,
		},
	},
	python: {
		add: {
			filename: "add_contact.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

contact = reloop.contacts.create(
    email="john.doe@example.com",
    first_name="John",
    last_name="Doe",
    status="subscribed",
    properties={"company": "Reloop", "role": "Developer"},
    group_ids=["grp_123456789"],
    channels=[{"channel_id": "chn_123456789", "subscription": "opt_in"}],
)`,
		},
		get: {
			filename: "get_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().get("cont_123456789")`,
		},
		list: {
			filename: "list_contact.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

contacts = reloop.contacts.list(page=1, limit=10, status="subscribed")`,
		},
		update: {
			filename: "update_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().update(
    "cont_123456789",
    first_name="Jane",
    last_name="Smith",
    unsubscribed=False,
    properties={
        "company": "Reloop",
        "role": "Designer",
    },
)`,
		},
		delete: {
			filename: "delete_contact.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().delete("cont_123456789")`,
		},
	},
	php: {
		add: {
			filename: "add_contact.php",
			code: `$reloop = Reloop::client('rl_123456789');

$contact = $reloop->contacts->create([
    'email' => 'john.doe@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'status' => 'subscribed',
    'properties' => ['company' => 'Reloop', 'role' => 'Developer'],
    'group_ids' => ['grp_123456789'],
    'channels' => [['channel_id' => 'chn_123456789', 'subscription' => 'opt_in']],
]);`,
		},
		get: {
			filename: "get_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->get('cont_123456789');`,
		},
		list: {
			filename: "list_contact.php",
			code: `$reloop = Reloop::client('rl_123456789');

$contacts = $reloop->contacts->list(['page' => 1, 'limit' => 10, 'status' => 'subscribed']);`,
		},
		update: {
			filename: "update_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->update(
  'cont_123456789',
  parameters: [
      'first_name' => 'Jane',
      'last_name' => 'Smith',
      'unsubscribed' => false,
      'properties' => [
          'company' => 'Reloop',
          'role' => 'Designer',
      ],
  ],
);`,
		},
		delete: {
			filename: "delete_contact.php",
			code: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->delete('cont_123456789');`,
		},
	},
	go: {
		add: {
			filename: "add_contact.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contact, _ := client.Contacts.Create(map[string]interface{}{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "subscribed",
})`,
		},
		get: {
			filename: "get_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Get("cont_123456789")
}`,
		},
		list: {
			filename: "list_contact.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contacts, _ := client.Contacts.List(map[string]interface{}{
    "page": 1,
    "limit": 10,
    "status": "subscribed",
})`,
		},
		update: {
			filename: "update_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Update("cont_123456789", map[string]interface{}{
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": map[string]interface{}{"company": "Reloop", "role": "Designer"}
    })
}`,
		},
		delete: {
			filename: "delete_contact.go",
			code: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Delete("cont_123456789")
}`,
		},
	},
	ruby: {
		add: {
			filename: "add_contact.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contact = reloop.contacts.create(
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  group_ids: ["grp_123456789"],
  channels: [{ channel_id: "chn_123456789", subscription: "opt_in" }],
)`,
		},
		get: {
			filename: "get_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/retrieve/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
contact = JSON.parse(response.body)`,
		},
		list: {
			filename: "list_contact.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contacts = reloop.contacts.list(page: 1, limit: 10, status: "subscribed")`,
		},
		update: {
			filename: "update_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
}.to_json

response = http.request(request)
contact = JSON.parse(response.body)`,
		},
		delete: {
			filename: "delete_contact.rb",
			code: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
result = JSON.parse(response.body)`,
		},
	},
	rust: {
		add: {
			filename: "add_contact.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().create(CreateContactParams {
        email: "john.doe@example.com".to_string(),
        first_name: Some("John".to_string()),
        last_name: Some("Doe".to_string()),
        status: Some(ContactStatus::Subscribed),
        ..Default::default()
    }).await?;

    Ok(())
}`,
		},
		get: {
			filename: "get_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().get("cont_123456789").await?;

    Ok(())
}`,
		},
		list: {
			filename: "list_contact.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list(Some(ListContactsParams {
        page: Some(1),
        limit: Some(10),
        status: Some(ContactStatus::Subscribed),
        ..Default::default()
    })).await?;

    Ok(())
}`,
		},
		update: {
			filename: "update_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().update("cont_123456789", json!({
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": {
        "company": "Reloop",
        "role": "Designer",
    },
    })).await?;

    Ok(())
}`,
		},
		delete: {
			filename: "delete_contact.rs",
			code: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().delete("cont_123456789").await?;

    Ok(())
}`,
		},
	},
	java: {
		add: {
			filename: "AddContact.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

Contact contact = reloop.contacts.create(Map.of(
    "email", "john.doe@example.com",
    "firstName", "John",
    "lastName", "Doe",
    "status", "subscribed"
));`,
		},
		get: {
			filename: "GetContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().get("cont_123456789");`,
		},
		list: {
			filename: "ListContact.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

ContactListResponse contacts = reloop.contacts.list(Map.of("page", 1, "limit", 10, "status", "subscribed"));`,
		},
		update: {
			filename: "UpdateContact.java",
			code: `import sh.reloop.email.ReloopEmail;
import java.util.*;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().update("cont_123456789", Map.of("first_name", "Jane", "last_name", "Smith", "unsubscribed", false, "properties", Map.of("company", "Reloop", "role", "Designer")));`,
		},
		delete: {
			filename: "DeleteContact.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().delete("cont_123456789");`,
		},
	},
	dotnet: {
		add: {
			filename: "AddContact.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contact = await reloop.Contacts.CreateAsync(new Dictionary<string, object?>
{
    ["email"] = "john.doe@example.com",
    ["firstName"] = "John",
    ["lastName"] = "Doe",
    ["status"] = "subscribed",
});`,
		},
		get: {
			filename: "GetContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().GetAsync("cont_123456789");`,
		},
		list: {
			filename: "ListContact.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contacts = await reloop.Contacts.ListAsync(new Dictionary<string, object?>
{
    ["page"] = 1,
    ["limit"] = 10,
    ["status"] = "subscribed",
});`,
		},
		update: {
			filename: "UpdateContact.cs",
			code: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

var parameters = new Dictionary<string, object?>();
parameters["first_name"] = "Jane";
parameters["last_name"] = "Smith";
parameters["unsubscribed"] = false;
parameters["properties"] = new Dictionary<string, object?>
{
    ["company"] = "Reloop",
    ["role"] = "Designer",
};
await reloop.Contacts().UpdateAsync("cont_123456789", parameters);`,
		},
		delete: {
			filename: "DeleteContact.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().DeleteAsync("cont_123456789");`,
		},
	},
	curl: {
		add: {
			filename: "add_contact.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/create \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"email": "john.doe@example.com","firstName": "John","lastName": "Doe","status": "subscribed","properties": {"company": "Reloop","role": "Developer"},"groupIds": ["grp_123456789"],"channels": [{"channelId": "chn_123456789","subscription": "opt_in"}]}'`,
		},
		get: {
			filename: "get_contact.sh",
			code: `curl https://reloop.sh/api/contacts/retrieve/cont_123456789 \\
  -H "x-api-key: re_123456789"`,
		},
		list: {
			filename: "list_contact.sh",
			code: `curl "https://reloop.sh/api/contacts/list?page=1&limit=10&status=subscribed" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		update: {
			filename: "update_contact.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/cont_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "subscribed",
  "properties": {
    "company": "Reloop",
    "role": "Designer"
  }
}'`,
		},
		delete: {
			filename: "delete_contact.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/cont_123456789 \\
  -H "x-api-key: re_123456789"`,
		},
	},
};

// ---------------------------------------------------------------------------
// Operations – all shown at once in a scrollable list
// ---------------------------------------------------------------------------

const operations = [
	{ id: "add", label: "Add Contact", docSlug: "post-api-contacts-create" },
	{ id: "get", label: "Get Contact", docSlug: "get-api-contacts-retrieve-by-contact_id" },
	{ id: "list", label: "List Contacts", docSlug: "get-api-contacts-list" },
	{ id: "update", label: "Update Contact", docSlug: "patch-api-contacts-by-contact_id" },
	{ id: "delete", label: "Delete Contact", docSlug: "delete-api-contacts-by-contact_id" },
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

const docBaseUrl =
	process.env.NEXT_PUBLIC_APP_URL ||
	process.env.NEXT_PUBLIC_URL ||
	"https://local.reloop.sh";

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
				<Drawer.Header className="pb-5!">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title className="font-semibold text-2xl">
							Contacts API
						</Drawer.Title>
					</div>
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
						className="scrollbar-none relative flex min-w-0 items-center overflow-x-auto px-4"
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

							let textColorStyle: React.CSSProperties | undefined;
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
									titleHref={`${docBaseUrl}/docs/api/contacts/${op.docSlug}`}
									noScroll={false}
								/>
							</section>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
