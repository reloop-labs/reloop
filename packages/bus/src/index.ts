import { jetstream, jetstreamManager } from "@nats-io/jetstream";
import {
	connect,
	headers,
	type Msg,
	type MsgHdrs,
	type NatsConnection,
	type Subscription,
} from "@nats-io/transport-node";
import type { BusEvent } from "./events";
import type { EventPayloads } from "./types";

export * from "./events";
export * from "./types";

class MessageBus {
	private nc: NatsConnection | null = null;
	private encoder = new TextEncoder();
	private subscriptions = new Map<string, Subscription>();

	async connect(url = "nats://localhost:4222") {
		if (this.nc) return;
		try {
			this.nc = await connect({ servers: url });
			console.log(`Connected to NATS at ${url}`);
		} catch (err) {
			console.error("Error connecting to NATS:", err);
			throw err;
		}
	}

	async healthCheck() {
		if (!this.nc) {
			throw new Error("Bus not connected");
		}
		await this.nc.flush();
		return true;
	}

	async publish<T extends BusEvent>(
		event: T,
		payload: EventPayloads[T],
		options?: { msgId?: string },
	) {
		if (!this.nc) throw new Error("Bus not connected. Call connect() first.");

		let h: MsgHdrs | undefined;
		if (options?.msgId) {
			h = headers();
			h.append("Nats-Msg-Id", options.msgId);
		}

		this.nc.publish(event, this.encoder.encode(JSON.stringify(payload)), {
			headers: h,
		});
	}

	async subscribe<T extends BusEvent>(
		event: T,
		callback: (payload: EventPayloads[T], msg: Msg) => void | Promise<void>,
		options?: { queue?: string },
	) {
		if (!this.nc) throw new Error("Bus not connected. Call connect() first.");

		const key = `${event}:${options?.queue ?? ""}`;
		const existing = this.subscriptions.get(key);
		if (existing) {
			try {
				existing.unsubscribe();
			} catch (err) {
				console.error(
					`Error unsubscribing existing subscription for ${key}:`,
					err,
				);
			}
		}

		const sub = this.nc.subscribe(event, { queue: options?.queue });
		this.subscriptions.set(key, sub);

		(async () => {
			for await (const m of sub) {
				try {
					const payload = m.json<EventPayloads[T]>();
					await callback(payload, m);
				} catch (err) {
					console.error(`Error processing event ${event}:`, err);
				}
			}
		})();

		return sub;
	}

	async ensureStream(name: string, subjects: string[]) {
		if (!this.nc) throw new Error("Bus not connected. Call connect() first.");
		const jsm = await jetstreamManager(this.nc);
		try {
			await jsm.streams.info(name);
			console.log(`[bus] JetStream stream '${name}' already exists`);
		} catch {
			await jsm.streams.add({
				name,
				subjects,
				retention: "interest" as const,
				max_age: 24 * 60 * 60 * 1_000_000_000, // 24h in nanoseconds
				storage: "file" as const,
				num_replicas: 1,
				discard: "old" as const,
				duplicate_window: 2 * 60 * 1_000_000_000, // 2min in nanoseconds
			});
			console.log(
				`[bus] JetStream stream '${name}' created for subjects: ${subjects.join(", ")}`,
			);
		}
	}

	async close() {
		if (this.nc) {
			await this.nc.drain();
			this.nc = null;
		}
	}
}

export const bus = new MessageBus();
export default bus;
