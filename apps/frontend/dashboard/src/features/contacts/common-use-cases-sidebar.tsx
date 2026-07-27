import { usePathname } from "next/navigation";
import { ChannelsApiDetails } from "#/components/api-details/channels";
import { ContactsApiDetails } from "#/components/api-details/contacts";
import { GroupsApiDetails } from "#/components/api-details/groups";
import { PropertiesApiDetails } from "#/components/api-details/properties";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";

const cardClassName = cn(
	"group flex w-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left cursor-pointer",
	"transition-[border-color,background-color,transform] duration-150 ease-out",
	"hover:border-stroke-soft-200 hover:bg-bg-weak-50/50",
	"active:scale-[0.99]",
	"dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 dark:hover:bg-bg-weak-50/40",
);

const sdkLanguages = [
	{ id: "nodejs", label: "Node.js", icon: siNodedotjs },
	{ id: "python", label: "Python", icon: siPython },
	{ id: "php", label: "PHP", icon: siPhp },
	{ id: "go", label: "Go", icon: siGo },
] as const;

export function ContactsCommonUseCasesSidebar() {
	const pathname = usePathname();

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isChannelsPage = pathname.includes("/contacts/channels");
	const isGroupsPage = pathname.includes("/contacts/groups");

	const title = isPropertiesPage
		? "Properties SDKs & endpoints"
		: isChannelsPage
			? "Channels SDKs & endpoints"
			: isGroupsPage
				? "Groups SDKs & endpoints"
				: "Contacts SDKs & endpoints";

	const subtitle = isPropertiesPage
		? "Ready-to-run samples & documentation for custom properties."
		: isChannelsPage
			? "Ready-to-run samples & documentation for channel management."
			: isGroupsPage
				? "Ready-to-run samples & documentation for contact groups."
				: "Ready-to-run samples & documentation for contact management.";

	const drawerDescription = isPropertiesPage
		? "Create, list, update, and delete custom contact properties via API."
		: isChannelsPage
			? "Create, list, update, and manage delivery channels via API."
			: isGroupsPage
				? "Create, retrieve, update, and manage subscriber groups via API."
				: "Create, list, update, and manage contacts and groups via API.";

	const useCases = isPropertiesPage
		? [
				{
					title: "Define custom attributes",
					description:
						"Store metadata like plan, role, subscription, and custom fields.",
					href: "https://reloop.sh/docs/features/contacts",
				},
				{
					title: "Segment contacts by properties",
					description:
						"Use custom properties for hyper-targeted audience filtering.",
					href: "https://reloop.sh/docs/api/contacts",
				},
			]
		: isChannelsPage
			? [
					{
						title: "Multi-channel delivery",
						description:
							"Route transactional & marketing messages across different channels.",
						href: "https://reloop.sh/docs/features/contacts",
					},
					{
						title: "Configure channel settings",
						description:
							"Set up credentials and defaults for each communication channel.",
						href: "https://reloop.sh/docs/api/contacts",
					},
				]
			: isGroupsPage
				? [
						{
							title: "Create audience segments",
							description:
								"Group subscribers by campaign, interest, or lifecycle stage.",
							href: "https://reloop.sh/docs/features/contacts",
						},
						{
							title: "Bulk group assignments",
							description:
								"Add or remove contacts from groups dynamically over API.",
							href: "https://reloop.sh/docs/api/contacts",
						},
					]
				: [
						{
							title: "Import contact lists",
							description:
								"Bulk import subscribers and custom attributes via CSV file or API.",
							href: "https://reloop.sh/docs/features/contacts",
						},
						{
							title: "Sync contacts via API",
							description:
								"Create, retrieve, update, and organize contact groups programmatically.",
							href: "https://reloop.sh/docs/api/contacts",
						},
					];

	const ApiDetailsComponent = isPropertiesPage
		? PropertiesApiDetails
		: isChannelsPage
			? ChannelsApiDetails
			: isGroupsPage
				? GroupsApiDetails
				: ContactsApiDetails;

	return (
		<aside className="space-y-3 lg:sticky lg:top-6">
			<div>
				<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
					{title}
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
					{subtitle}
				</p>
			</div>

			<ApiDetailsComponent
				renderTrigger={({ isOpen, open }: { isOpen: boolean; open: () => void }) => (
					<button
						type="button"
						onClick={open}
						aria-expanded={isOpen}
						className={cn(
							cardClassName,
							isOpen && "border-stroke-soft-200 bg-bg-weak-50/60",
						)}
					>
						<div className="flex items-start justify-between gap-3">
							<span className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
								Browse samples
							</span>
							<Icon
								name="chevron-right"
								className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
							/>
						</div>
						<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
							{drawerDescription}
						</p>
						<div className="mt-2.5 flex items-center gap-0.5">
							{sdkLanguages.map(({ id, label, icon }) => (
								<span
									key={id}
									title={label}
									className="flex items-center justify-center p-0.5"
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										width={16}
										height={16}
										aria-hidden
										className="shrink-0"
										fill={`#${icon.hex}`}
									>
										<path d={icon.path} />
									</svg>
								</span>
							))}
						</div>
					</button>
				)}
			/>

			{useCases.map((item) => (
				<a
					key={item.title}
					href={item.href}
					target="_blank"
					rel="noreferrer"
					className={cardClassName}
				>
					<div className="flex items-start justify-between gap-3">
						<h3 className="font-semibold text-sm text-text-strong-950 transition-colors group-hover:text-[#1868DF] dark:group-hover:text-blue-400">
							{item.title}
						</h3>
						<Icon
							name="chevron-right"
							className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-text-sub-600"
						/>
					</div>
					<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed">
						{item.description}
					</p>
				</a>
			))}
		</aside>
	);
}
