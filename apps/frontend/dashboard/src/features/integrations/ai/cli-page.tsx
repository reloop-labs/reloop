import {
	BackLink,
	BrandMark,
	PageIntro,
	SetupSteps,
} from "./ai-integration-ui";
import type { SetupStep } from "./mcp-clients";

const cliSteps: SetupStep[] = [
	{
		title: "Install and sign in",
		body: "Opens your browser to authorize this workspace.",
		code: {
			value: "npx -y reloop-cli init --all --browser",
			lang: "bash",
			label: "Terminal",
		},
	},
	{
		title: "Teach your agent the CLI",
		body: "Adds the Reloop skill to Claude Code, Codex, and other skill-aware agents.",
		code: {
			value: "npx skills add reloop/reloop-cli",
			lang: "bash",
			label: "Terminal",
		},
	},
	{
		title: "Send your first email",
		body: "Every command takes --json for machine-readable output in scripts and agents.",
		code: {
			value: `reloop emails send \\
  --from "you@yourdomain.com" \\
  --to "user@example.com" \\
  --subject "Hello from Reloop" \\
  --text "It works."`,
			lang: "bash",
			label: "Terminal",
		},
	},
];

export function CliPage() {
	return (
		<div className="mx-auto w-full max-w-3xl space-y-8 p-6 pb-12 lg:p-8">
			<BackLink href="/integrations" label="Integrations" />

			<PageIntro
				icon={
					<BrandMark
						simpleIconKey="siGnubash"
						fallbackIcon="terminal"
						size="lg"
					/>
				}
				title="Reloop CLI"
				description="Send, schedule, and inspect email from your terminal, CI, or a coding agent."
			/>

			<SetupSteps steps={cliSteps} />
		</div>
	);
}
