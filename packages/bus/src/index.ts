import {
	connect,
	type Msg,
	type NatsConnection,
} from "@nats-io/transport-node";
import type { BusEvent, EventPayloads } from "./events";

export * from "./events";

class MessageBus {
	private nc: NatsConnection | null = null;
	private encoder = new TextEncoder();

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

	async publish<T extends BusEvent>(event: T, payload: EventPayloads[T]) {
		if (!this.nc) throw new Error("Bus not connected. Call connect() first.");
		this.nc.publish(event, this.encoder.encode(JSON.stringify(payload)));
	}

	async subscribe<T extends BusEvent>(
		event: T,
		callback: (payload: EventPayloads[T], msg: Msg) => void | Promise<void>,
		options?: { queue?: string },
	) {
		if (!this.nc) throw new Error("Bus not connected. Call connect() first.");

		const sub = this.nc.subscribe(event, { queue: options?.queue });

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

	async close() {
		if (this.nc) {
			await this.nc.drain();
			this.nc = null;
		}
	}
}

export const bus = new MessageBus();
export default bus;
