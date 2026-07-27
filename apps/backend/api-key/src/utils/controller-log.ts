import type { ApiKeyCredentialLog } from "@reloop/api-key/credential/api-key-credential";
import { useLogger } from "evlog/elysia";

/** Adapts Elysia request logger to the credential module log seam. */
export function controllerLog(): ApiKeyCredentialLog {
	const elysiaLog = useLogger();
	return {
		info: (message: string) => {
			elysiaLog.info(message);
		},
		warn: (message: string) => {
			elysiaLog.warn(message);
		},
		error: (message: string, data?: unknown) => {
			if (data !== undefined) {
				elysiaLog.error({
					message,
					error: data instanceof Error ? data.message : String(data),
					cause:
						data instanceof Error && data.cause != null
							? String(data.cause)
							: undefined,
				});
			} else {
				elysiaLog.error(message);
			}
		},
	};
}
