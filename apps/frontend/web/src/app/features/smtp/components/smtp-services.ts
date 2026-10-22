import {
	siAuth0,
	siDirectus,
	siDiscourse,
	siGhost,
	siGrafana,
	siKeycloak,
	siMetabase,
	siN8n,
	siNextcloud,
	siStrapi,
	siSupabase,
	siWordpress,
} from "simple-icons";
import type { Service } from "../../transaction-emails/components/connect-services-section";

const SMTP_INTRO = "/docs/examples/smtp/introduction";

/** Tools with a built-in SMTP setting; each sends through Reloop as-is. */
export const SMTP_SERVICES: Service[] = [
	{
		label: "WordPress",
		href: "/docs/integrations/wordpress",
		icon: siWordpress,
	},
	{
		label: "Supabase Auth",
		href: "/docs/guides/supabase-quickstart",
		icon: siSupabase,
	},
	{ label: "Ghost", href: "/docs/integrations/ghost", icon: siGhost },
	{ label: "Strapi", href: "/docs/integrations/strapi", icon: siStrapi },
	{ label: "Directus", href: "/docs/integrations/directus", icon: siDirectus },
	{ label: "n8n", href: "/docs/integrations/n8n", icon: siN8n },
	{ label: "Auth0", href: SMTP_INTRO, icon: siAuth0 },
	{ label: "Keycloak", href: SMTP_INTRO, icon: siKeycloak },
	{ label: "Metabase", href: SMTP_INTRO, icon: siMetabase },
	{ label: "Grafana", href: SMTP_INTRO, icon: siGrafana },
	{ label: "Nextcloud", href: SMTP_INTRO, icon: siNextcloud },
	{ label: "Discourse", href: SMTP_INTRO, icon: siDiscourse },
];
