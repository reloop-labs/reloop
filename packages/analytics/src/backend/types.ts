export type Properties = { [key: string]: string | number | Properties };

export class PulseHTTPError extends Error {
	statusCode;

	constructor(statusCode: number, message = "") {
		super(message);
		this.name = "PulseHTTPError";
		this.statusCode = statusCode;
	}

	toString(): string {
		return `${this.name}: ${this.statusCode}, ${this.message}`;
	}
}
