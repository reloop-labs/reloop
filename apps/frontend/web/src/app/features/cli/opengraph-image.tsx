import {
	aiToolsOgContentType,
	aiToolsOgSize,
	renderAiToolsOgImage,
} from "@reloop/web/lib/landing/ai-tools/og-image";

export const alt = "CLI | Reloop";
export const size = aiToolsOgSize;
export const contentType = aiToolsOgContentType;

export default function OpenGraphImage() {
	return renderAiToolsOgImage({
		title: "Reloop CLI",
		description:
			"Send, schedule and receive email from your terminal, CI or a coding agent.",
		lines: [
			{
				command: "npx -y reloop-cli init --all --browser",
				detail: "Install and sign in through the browser.",
			},
			{
				command: "reloop emails send --json",
				detail: "Machine-readable output for agents.",
			},
			{
				command: "reloop emails receiving listen",
				detail: "Stream inbound email as it arrives.",
			},
		],
	});
}
