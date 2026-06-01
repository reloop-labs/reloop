"use client";

import { useEffect, useState } from "react";
import type { WebsocketProvider } from "y-websocket";

export interface RemoteCursor {
	clientId: number;
	name?: string;
	color: string;
	avatar?: string;
	email?: string;
	x: number; // percentage
	y: number; // percentage
}

export function useRemoteCursors(
	provider: WebsocketProvider | null,
): RemoteCursor[] {
	const [cursors, setCursors] = useState<RemoteCursor[]>([]);

	useEffect(() => {
		if (!provider) return;

		const update = () => {
			const remote: RemoteCursor[] = [];

			provider.awareness.getStates().forEach((state, clientId) => {
				if (clientId === provider.awareness.clientID) return;
				if (!state.user || !state.mouseCursor) return;

				const { x, y } = state.mouseCursor as { x: number; y: number };
				remote.push({
					clientId,
					name: state.user.name,
					color: state.user.color,
					avatar: state.user.avatar,
					email: state.user.email,
					x,
					y,
				});
			});

			setCursors(remote);
		};

		provider.awareness.on("change", update);
		update();

		return () => {
			provider.awareness.off("change", update);
		};
	}, [provider]);

	return cursors;
}
