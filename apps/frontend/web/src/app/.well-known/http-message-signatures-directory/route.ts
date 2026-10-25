import { directoryResponse } from "@reloop/web/lib/web-bot-auth";

/** Public keys Reloop's agents sign outbound HTTP requests with (Web Bot Auth). */
export function GET(request: Request) {
	return directoryResponse(request);
}
