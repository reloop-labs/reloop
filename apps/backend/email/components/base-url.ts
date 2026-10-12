/**
 * Origin for links and assets in emails. Self-hosters set `BASE_URL` to their
 * own domain; senders still pass `baseUrl` explicitly, so this mainly covers
 * template previews and any prop a sender leaves out.
 */
export const defaultBaseUrl = (
	process.env.BASE_URL || "https://reloop.sh"
).replace(/\/$/, "");
