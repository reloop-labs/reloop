import { JsonLd } from "@reloop/web/components/json-ld";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import {
	getMcpClient,
	isMcpClientSlug,
	MCP_CLIENT_SLUGS,
	MCP_DASHBOARD_HREF,
	MCP_PAGE_PATH,
	mcpClientPath,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { breadcrumbJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionFrame } from "../../../sdk/components/section-frame";
import McpClientHero from "../components/client-hero";
import McpClientMore from "../components/client-more";
import McpClientSteps from "../components/client-steps";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
	params: Promise<{ client: string }>;
};

export function generateStaticParams() {
	return MCP_CLIENT_SLUGS.map((client) => ({ client }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { client: slug } = await params;
	const client = getMcpClient(slug);
	if (!client) {
		return { title: "MCP Server | Reloop" };
	}
	const title = `${client.name} Email MCP Server: Connect ${client.name} to Reloop`;
	const socialTitle = `Reloop MCP for ${client.name} | Reloop`;
	const description = `Connect ${client.name} to Reloop's hosted MCP server. Sign in with OAuth, no API key, then send email and manage contacts, campaigns, domains and webhooks from ${client.name}.`;
	const url = `${getSiteUrl()}${mcpClientPath(client.slug)}`;
	const ogImage = {
		url: `${url}/opengraph-image`,
		width: 1200,
		height: 630,
		alt: `Reloop MCP for ${client.name} | Reloop`,
	};
	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title: socialTitle,
			description,
			type: "website",
			url,
			siteName: "Reloop",
			images: [ogImage],
		},
		twitter: {
			card: "summary_large_image",
			title: socialTitle,
			description,
			images: [ogImage.url],
		},
		keywords: [
			`${client.name} email MCP server`,
			`${client.name} MCP`,
			`${client.name} send email`,
			`${client.name} email integration`,
			"email MCP server",
			"Reloop",
		],
	};
}

export default async function McpClientPage({ params }: PageProps) {
	const { client: slug } = await params;
	if (!isMcpClientSlug(slug)) {
		notFound();
	}
	const client = getMcpClient(slug);
	if (!client) {
		notFound();
	}

	return (
		<main className="w-full max-w-full overflow-x-clip bg-bg-white-0 dark:bg-black">
			<JsonLd
				data={breadcrumbJsonLd([
					{ name: "Features", path: "/features" },
					{ name: "MCP server", path: MCP_PAGE_PATH },
					{ name: client.name, path: mcpClientPath(client.slug) },
				])}
			/>
			<McpClientHero client={client} />
			<McpClientSteps client={client} />
			<McpClientMore current={client} />
			<SectionFrame>
				<div aria-hidden className="h-12 sm:h-16" />
				<BlueprintCta
					headlineLine1={`Connect ${client.name} to Reloop.`}
					headlineLine2="Sign in once."
					subtext="Your agent can do everything you can do in the Reloop dashboard. 6,000 free emails every month."
					primaryLabel="Connect in the dashboard"
					primaryHref={MCP_DASHBOARD_HREF}
					secondaryLabel="MCP overview"
					secondaryHref={MCP_PAGE_PATH}
				/>
			</SectionFrame>
		</main>
	);
}
