export type Properties = { [key: string]: string | number | Properties };

export class PulseHTTPError extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string = "") {
		super(message);
		this.name = "PulseHTTPError";
		this.statusCode = statusCode;
	}

	toString(): string {
		return `${this.name}: ${this.statusCode}, ${this.message}`;
	}
}

