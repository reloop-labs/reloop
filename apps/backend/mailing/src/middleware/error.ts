import { MailingError } from "@reloop/be-mailing/lib/errors";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

export const errorMiddleware = new Elysia({ name: "error-middleware" })
	.use(evlog())
	.onError(({ code, error, set, log }) => {
		if (error instanceof MailingError) {
			log?.warn(`${error.name} (${error.code})`, {
				message: error.message,
				status: error.status,
			});
			set.status = error.status;
			return { message: error.message, code: error.code };
		}

		const message =
			(error as any)?.response?.message ||
			(error as any)?.body?.message ||
			(error as Error)?.message ||
			String(error);

		if (code === "VALIDATION") {
			log?.warn("Validation error", {
				message,
				error: (error as any).message,
			});
			set.status = 422;
			return { message: (error as any).message };
		}

		log?.error("Unhandled error", {
			code,
			message,
			stack: error instanceof Error ? error.stack : undefined,
		});

		set.status = 500;
		return { message: "Internal server error" };
	});
