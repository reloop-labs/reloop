/**
 * Base error class for all Reloop SDK errors
 */
export class ReloopError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error thrown when an API request fails
 */
export class APIError extends ReloopError {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly statusText?: string,
		public readonly response?: unknown,
		public readonly code?: string,
	) {
		super(message, code);
		this.name = "APIError";
	}
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends APIError {
	constructor(message = "Authentication failed") {
		super(message, 401, "Unauthorized", undefined, "AUTH_ERROR");
		this.name = "AuthenticationError";
	}
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends APIError {
	constructor(message = "Resource not found") {
		super(message, 404, "Not Found", undefined, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends ReloopError {
	constructor(
		message: string,
		public readonly fields?: Record<string, string[]>,
	) {
		super(message, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

/**
 * Error thrown when a rate limit is exceeded
 */
export class RateLimitError extends APIError {
	constructor(message = "Rate limit exceeded") {
		super(message, 429, "Too Many Requests", undefined, "RATE_LIMIT");
		this.name = "RateLimitError";
	}
}

/**
 * Error thrown when the server returns an error
 */
export class ServerError extends APIError {
	constructor(message = "Internal server error") {
		super(message, 500, "Internal Server Error", undefined, "SERVER_ERROR");
		this.name = "ServerError";
	}
}
