/**
 * A step failure written for the person reading the run, not a stack trace.
 * Anything else a step throws is logged and shown as a generic message.
 */
export class StepError extends Error {
	/** Worth trying again (a temporary problem), rather than failing the run. */
	readonly retryable: boolean;

	constructor(
		message: string,
		options: { retryable: boolean; cause?: unknown },
	) {
		super(message, { cause: options.cause });
		this.name = "StepError";
		this.retryable = options.retryable;
	}
}

export const GENERIC_STEP_ERROR =
	"Something went wrong on our side while running this step.";
