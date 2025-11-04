export interface AnalyticsClientOptions {
	apiUrl?: string;
	timeout?: number;
}

export type PropertiesValue =
	| string
	| number
	| boolean
	| null
	| { [key: string]: PropertiesValue };

export interface AnalyticsClient {
	apiUrl: string;
	timeout: number;
	track(body: {
		event: string;
		properties?: Record<string, PropertiesValue>;
		distinct_id?: string;
		user_id?: string;
		organization_id?: string;
	}): Promise<{
		uuid: string;
		event: string;
		message: string;
	}>;
}

export function createAnalyticsClient(
	opts?: AnalyticsClientOptions,
): AnalyticsClient {
	const apiUrl =
		opts?.apiUrl ||
		process.env.ANALYTICS_API_URL ||
		"http://localhost:8012/api/analytics/v1";
	const timeout = opts?.timeout || 30000;

	return {
		apiUrl,
		timeout,
		async track(body) {
			const url = `${apiUrl}/track`;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({
						message: `HTTP ${response.status}: ${response.statusText}`,
					}));
					throw new Error(
						errorData.message ||
							`HTTP ${response.status}: ${response.statusText}`,
					);
				}

				const data = await response.json();
				return data;
			} catch (error) {
				clearTimeout(timeoutId);
				if (error instanceof Error) {
					if (error.name === "AbortError") {
						throw new Error(`Request timeout after ${timeout}ms`);
					}
					throw error;
				}
				throw new Error("Unknown error occurred");
			}
		},
	};
}

export const analyticsClient = createAnalyticsClient();

export async function checkHealth(
	client: AnalyticsClient = analyticsClient,
): Promise<boolean> {
	try {
		// Try to ping the analytics service base URL (remove /v1 to get base)
		const baseUrl = client.apiUrl.replace(/\/v1.*$/, "");
		const response = await fetch(baseUrl, {
			method: "GET",
			signal: AbortSignal.timeout(5000),
		});
		return response.ok;
	} catch {
		return false;
	}
}
