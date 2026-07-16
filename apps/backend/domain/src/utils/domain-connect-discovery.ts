import { resolveTxt } from "node:dns/promises";
import { useLogger } from "evlog/elysia";

export interface DCSettings {
	providerId: string;
	providerName: string;
	providerDisplayName?: string;
	urlSyncUX?: string; // URL for sync flow consent page
	urlAsyncUX?: string; // URL for async flow (not used)
	urlAPI: string; // REST API base URL
	width?: number;
	height?: number;
}

export interface DCDiscoveryResult {
	supported: boolean;
	templateSupported: boolean;
	provider: { id: string; name: string; displayName: string } | null;
	urlSyncUX: string | null;
	urlAPI: string | null;
	error?: string;
}

/**
 * Full discovery: DNS TXT → settings API → template check.
 */
export async function discoverDomainConnect(
	rootDomain: string,
	providerId: string,
	serviceId: string,
): Promise<DCDiscoveryResult> {
	const log = useLogger();
	const notSupported: DCDiscoveryResult = {
		supported: false,
		templateSupported: false,
		provider: null,
		urlSyncUX: null,
		urlAPI: null,
	};

	try {
		// Step 1: DNS TXT lookup for _domainconnect
		const dcHost = await resolveDCHost(rootDomain);
		if (!dcHost) {
			log.info(`No Domain Connect TXT record found for ${rootDomain}`);
			return {
				...notSupported,
				error: "DNS provider does not support Domain Connect",
			};
		}

		// Step 2: Fetch provider settings
		const settings = await fetchDCSettings(dcHost, rootDomain);
		if (!settings || !settings.urlSyncUX) {
			log.info(`Domain Connect settings missing urlSyncUX for ${rootDomain}`);
			return {
				...notSupported,
				error: "DNS provider does not support synchronous flow",
			};
		}

		// Step 3: Check if our template is onboarded
		const templateOk = await checkTemplateSupport(
			settings.urlAPI,
			providerId,
			serviceId,
		);

		return {
			supported: true,
			templateSupported: templateOk,
			provider: {
				id: settings.providerId,
				name: settings.providerName,
				displayName: settings.providerDisplayName || settings.providerName,
			},
			urlSyncUX: settings.urlSyncUX,
			urlAPI: settings.urlAPI,
			error: templateOk
				? undefined
				: "DNS provider supports Domain Connect but has not onboarded the Reloop template yet",
		};
	} catch (error) {
		log.error(`Domain Connect discovery failed for ${rootDomain}: ${error}`);
		return { ...notSupported, error: "Discovery failed" };
	}
}

/**
 * Resolve _domainconnect TXT record → DC API host.
 */
export async function resolveDCHost(
	rootDomain: string,
): Promise<string | null> {
	try {
		const records = await resolveTxt(`_domainconnect.${rootDomain}`);
		const flat = records.flat();
		return flat[0] || null;
	} catch {
		return null;
	}
}

/**
 * Fetch Domain Connect settings from the provider.
 */
export async function fetchDCSettings(
	dcHost: string,
	domain: string,
): Promise<DCSettings | null> {
	try {
		const url = `https://${dcHost}/v2/${domain}/settings`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) return null;
		return (await response.json()) as DCSettings;
	} catch {
		return null;
	}
}

/**
 * Check if a provider has onboarded a specific template.
 */
export async function checkTemplateSupport(
	urlAPI: string,
	providerId: string,
	serviceId: string,
): Promise<boolean> {
	try {
		const url = `${urlAPI}/v2/domainTemplates/providers/${providerId}/services/${serviceId}`;
		const response = await fetch(url, {
			signal: AbortSignal.timeout(10_000),
		});
		return response.ok;
	} catch {
		return false;
	}
}
