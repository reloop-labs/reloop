import {
	APIError,
	AuthenticationError,
	NotFoundError,
	RateLimitError,
	ServerError,
} from "./errors.js";

export interface ReloopConfig {
	url: string;
	key: string;
}

export class HTTPClient {
	private baseURL: string;
	private apiKey: string;

	constructor(config: ReloopConfig) {
		// Normalize base URL (remove trailing slash)
		this.baseURL = config.url.replace(/\/+$/, "");
		this.apiKey = config.key;

		if (!this.baseURL) {
			throw new Error("Base URL is required");
		}
		if (!this.apiKey) {
			throw new Error("API key is required");
		}
	}

	private getHeaders(): Record<string, string> {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.apiKey}`,
			"X-API-Key": this.apiKey, // Fallback header
		};
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		const contentType = response.headers.get("content-type");
		const isJSON = contentType?.includes("application/json");

		let data: unknown;
		try {
			data = isJSON ? await response.json() : await response.text();
		} catch {
			data = { message: "Failed to parse response" };
		}

		if (!response.ok) {
			const status = response.status;
			const statusText = response.statusText;

			// Handle specific error cases
			if (status === 401) {
				throw new AuthenticationError(
					typeof data === "object" &&
						data !== null &&
						"message" in data &&
						typeof data.message === "string"
						? data.message
						: "Authentication failed",
				);
			}

			if (status === 404) {
				throw new NotFoundError(
					typeof data === "object" &&
						data !== null &&
						"message" in data &&
						typeof data.message === "string"
						? data.message
						: "Resource not found",
				);
			}

			if (status === 429) {
				throw new RateLimitError(
					typeof data === "object" &&
						data !== null &&
						"message" in data &&
						typeof data.message === "string"
						? data.message
						: "Rate limit exceeded",
				);
			}

			if (status >= 500) {
				throw new ServerError(
					typeof data === "object" &&
						data !== null &&
						"message" in data &&
						typeof data.message === "string"
						? data.message
						: "Internal server error",
				);
			}

			// Generic API error
			throw new APIError(
				typeof data === "object" &&
					data !== null &&
					"message" in data &&
					typeof data.message === "string"
					? data.message
					: `Request failed with status ${status}`,
				status,
				statusText,
				data,
			);
		}

		return data as T;
	}

	async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
		let url = `${this.baseURL}${path}`;

		// Add query parameters if provided
		if (params && Object.keys(params).length > 0) {
			const searchParams = new URLSearchParams();
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			}
			const queryString = searchParams.toString();
			if (queryString) {
				url += `?${queryString}`;
			}
		}

		const response = await fetch(url, {
			method: "GET",
			headers: this.getHeaders(),
		});

		return this.handleResponse<T>(response);
	}

	async post<T>(path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${this.baseURL}${path}`, {
			method: "POST",
			headers: this.getHeaders(),
			body: body ? JSON.stringify(body) : undefined,
		});

		return this.handleResponse<T>(response);
	}

	async put<T>(path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${this.baseURL}${path}`, {
			method: "PUT",
			headers: this.getHeaders(),
			body: body ? JSON.stringify(body) : undefined,
		});

		return this.handleResponse<T>(response);
	}

	async patch<T>(path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${this.baseURL}${path}`, {
			method: "PATCH",
			headers: this.getHeaders(),
			body: body ? JSON.stringify(body) : undefined,
		});

		return this.handleResponse<T>(response);
	}

	async delete<T>(path: string): Promise<T> {
		const response = await fetch(`${this.baseURL}${path}`, {
			method: "DELETE",
			headers: this.getHeaders(),
		});

		return this.handleResponse<T>(response);
	}
}
