"use client";

import type { ChannelData } from "@reloop/links/lib/preferences-data";
import { toWebMcpText, type WebMcpTool } from "@reloop/webmcp";
import { usePageWebMcpTools } from "@reloop/webmcp/client";
import { type RefObject, useMemo } from "react";

type Subscriptions = Record<string, boolean>;

interface Options {
	token: string;
	email: string;
	organizationName: string;
	channels: ChannelData[];
	/** Saved subscription state, read when an agent asks for preferences. */
	savedRef: RefObject<Subscriptions>;
	/** Applies saved changes to the page so the user sees what the agent did. */
	onSaved: (patch: Subscriptions) => void;
}

async function post(path: string, body: unknown, signal?: AbortSignal) {
	const res = await fetch(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		signal,
	});
	if (!res.ok) throw new Error(`Request failed (${res.status})`);
}

/**
 * Exposes this preference center to in-browser agents via WebMCP, so an
 * assistant acting for the recipient can read and change their subscriptions.
 * Scoped to this page's token; tools go away when the page unmounts.
 */
export function usePreferencesWebMcpTools({
	token,
	email,
	organizationName,
	channels,
	savedRef,
	onSaved,
}: Options): void {
	const tools = useMemo<WebMcpTool[]>(() => {
		const channelIds = channels.map((channel) => channel.id);
		return [
			{
				name: "get_email_preferences",
				description: `List ${organizationName}'s email channels for ${email} and whether the recipient is subscribed to each.`,
				inputSchema: { type: "object", properties: {} },
				annotations: { readOnlyHint: true },
				execute: async () =>
					toWebMcpText({
						email,
						organization: organizationName,
						channels: channels.map((channel) => ({
							id: channel.id,
							name: channel.name,
							description: channel.description,
							subscribed: savedRef.current[channel.id] ?? false,
						})),
					}),
			},
			{
				name: "set_email_subscription",
				description: `Subscribe ${email} to, or unsubscribe them from, one of ${organizationName}'s email channels. Saves immediately.`,
				inputSchema: {
					type: "object",
					properties: {
						channelId: {
							type: "string",
							enum: channelIds,
							description: "Channel ID from get_email_preferences",
						},
						subscribe: {
							type: "boolean",
							description: "true to subscribe, false to unsubscribe",
						},
					},
					required: ["channelId", "subscribe"],
				},
				execute: async (input, { signal }) => {
					const { channelId, subscribe } = input as {
						channelId: string;
						subscribe: boolean;
					};
					if (!channelIds.includes(channelId)) {
						throw new Error(`Unknown channel: ${channelId}`);
					}
					await post(
						"/api/contacts/v1/preferences/update",
						{ token, channelId, subscribe },
						signal,
					);
					onSaved({ [channelId]: subscribe });
					return toWebMcpText({ channelId, subscribed: subscribe });
				},
			},
			{
				name: "unsubscribe_from_all",
				description: `Unsubscribe ${email} from every ${organizationName} email channel. Confirm with the user first.`,
				inputSchema: { type: "object", properties: {} },
				execute: async (_input, { signal }) => {
					await post(
						"/api/contacts/v1/preferences/unsubscribe-all",
						{ token },
						signal,
					);
					onSaved(Object.fromEntries(channelIds.map((id) => [id, false])));
					return toWebMcpText({ unsubscribedFromAll: true });
				},
			},
		];
	}, [token, email, organizationName, channels, savedRef, onSaved]);

	usePageWebMcpTools(tools);
}
