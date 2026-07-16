import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { Code, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { siGnubash, siJson } from "simple-icons";
import { toast } from "sonner";
import { useSWR } from "#/features/home/lib/use-swr-compat";

type AgentTab = "skill" | "cli" | "mcp";

interface ApiKeyData {
	id: string;
	start: string | null;
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
	total: number;
}

const tabItems: { value: AgentTab; title: string }[] = [
	{ value: "skill", title: "SKILL.md" },
	{ value: "cli", title: "CLI" },
	{ value: "mcp", title: "MCP Config" },
];

const skillMarkdown = `# Reloop AI Agent Skill
This context file guides your AI agent on integrating with Reloop's developer APIs.
- Send transactional emails via SMTP relays or REST API
- Triage inbox notifications and route conversation logs
- Automate multi-step conditional workflows`;

const cliCommand = "npx -y reloop-cli init --all --browser";

export function AgentIntegrationsCard() {
	const { activeOrganization } = useActiveOrganization();
	const [activeTab, setActiveTab] = useState<AgentTab>("skill");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIndex = tabItems.findIndex((item) => item.value === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const { data: apiKeysData } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id ? "/api/api-key/v1/?limit=10&page=1" : null,
	);

	const primaryApiKey = apiKeysData?.apiKeys?.[0];
	const displayPrefix = primaryApiKey?.start || "rl_live";
	const unmaskedKey = primaryApiKey
		? `${displayPrefix}_7f8e0d9a8b7c6d5e4f3g2h1i0j_9d06`
		: `${displayPrefix}_5a7c2b9f8d1e3d4e6a8b7c9f8e0d_9d06`;

	const mcpConfigText = `{
  "mcpServers": {
    "reloop-mcp": {
      "command": "npx",
      "args": ["-y", "@reloop/mcp-server"],
      "env": {
        "RELOOP_API_KEY": "${primaryApiKey ? unmaskedKey : "YOUR_API_KEY"}"
      }
    }
  }
}`;

	const handleCopySkill = () => {
		navigator.clipboard.writeText(skillMarkdown);
		toast.success("SKILL.md content copied to clipboard");
	};

	return (
		<div className="group flex h-fit w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<span className="flex items-center gap-2 font-medium text-sm text-text-sub-600 dark:text-white/60">
					<Icon name="sparkling" className="h-4 w-4 shrink-0" />
					<span>Agent Integrations</span>
				</span>
			</div>

			<div className="-mt-1.5 flex h-fit flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				<div className="flex shrink-0 border-stroke-soft-100/50 border-b px-4 dark:border-white/5">
					<TabMenuHorizontal.Root value={activeTab} className="w-full">
						<TabMenuHorizontal.List className="relative h-10 w-full justify-start gap-0 border-b-0 py-0">
							{tabItems.map(({ value, title }, index) => (
								<TabMenuHorizontal.Trigger
									ref={(el) => {
										if (el) {
											buttonRefs.current[index] = el;
										}
									}}
									onPointerEnter={() => setHoveredIdx(index)}
									onPointerLeave={() => setHoveredIdx(undefined)}
									className={cn(
										"flex h-12 cursor-pointer items-center gap-2 px-3.5 py-0! font-medium text-xs",
										hoveredIdx === undefined &&
											activeIndex === index &&
											"text-text-strong-950 dark:text-white",
									)}
									key={value}
									value={value}
									onClick={() => setActiveTab(value)}
								>
									{title}
								</TabMenuHorizontal.Trigger>
							))}
							<AnimatePresence>
								{rect && activeIndex !== -1 ? (
									<motion.div
										className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10 dark:bg-white/10"
										initial={{
											pointerEvents: "none",
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
											opacity: 0,
										}}
										animate={{
											pointerEvents: "none",
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
											opacity: 1,
										}}
										exit={{
											pointerEvents: "none",
											opacity: 0,
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
										}}
										transition={{ duration: 0.14 }}
									/>
								) : null}
							</AnimatePresence>
						</TabMenuHorizontal.List>
					</TabMenuHorizontal.Root>
				</div>

				<div className="flex h-fit flex-col justify-center p-4">
					{activeTab === "skill" && (
						<div className="flex items-center justify-between rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-white/5 dark:bg-white/[0.01]">
							<div className="flex min-w-0 items-center gap-2.5">
								<div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
									<Code className="h-4 w-4" />
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-text-strong-950 text-xs dark:text-white">
										SKILL.md
									</p>
									<p className="truncate text-[10px] text-text-sub-600 dark:text-white/50">
										Instruction file for AI agents context
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleCopySkill}
								className="flex shrink-0 items-center gap-1 rounded-lg border border-stroke-soft-100 bg-white px-3 py-1.5 font-semibold text-text-strong-950 text-xs shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:hover:bg-white/5"
							>
								<Copy className="h-3 w-3" />
								Copy
							</button>
						</div>
					)}

					{activeTab === "cli" && (
						<CopyCodeBlock
							code={`$ ${cliCommand}`}
							lang="bash"
							copyValue={cliCommand}
							label="Terminal"
							si={siGnubash}
							codeExtraPadding={true}
						/>
					)}

					{activeTab === "mcp" && (
						<CopyCodeBlock
							code={mcpConfigText}
							lang="json"
							label="Claude Desktop"
							si={siJson}
							codeExtraPadding={true}
							maxHeight="120px"
						/>
					)}
				</div>
			</div>
		</div>
	);
}
