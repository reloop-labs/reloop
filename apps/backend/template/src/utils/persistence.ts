import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { log } from "evlog";
import * as Y from "yjs";

const MAX_UPDATES_BEFORE_COMPACT = 100;

export class YjsPersistence {
	private docCache: RedisCache;
	private updateCache: RedisCache;

	constructor() {
		this.docCache = new RedisCache("yjsdoc", 60 * 60 * 24 * 90);
		this.updateCache = new RedisCache("yjsupd", 60 * 60 * 24 * 30);
	}

	private encode(data: Uint8Array): string {
		return Buffer.from(data).toString("base64");
	}

	private decode(data: string): Uint8Array {
		return new Uint8Array(Buffer.from(data, "base64"));
	}

	async bindState(name: string, doc: Y.Doc): Promise<void> {
		const snapshot = await this.docCache.get<string>(name);
		if (snapshot) {
			Y.applyUpdate(doc, this.decode(snapshot));
		}
		const updates = (await this.updateCache.get<string[]>(name)) ?? [];
		for (const u of updates) {
			Y.applyUpdate(doc, this.decode(u));
		}
		if (updates.length >= MAX_UPDATES_BEFORE_COMPACT) {
			await this.compact(name, doc);
		}
		doc.on("update", async (update: Uint8Array) => {
			await this.storeUpdate(name, update);
		});
	}
	async storeUpdate(name: string, update: Uint8Array): Promise<void> {
		const existing = (await this.updateCache.get<string[]>(name)) ?? [];
		existing.push(this.encode(update));
		await this.updateCache.set(name, existing);

		if (existing.length >= MAX_UPDATES_BEFORE_COMPACT) {
			await this.compact(name, null);
		}
	}

	async writeState(name: string, doc: Y.Doc): Promise<void> {
		await this.compact(name, doc);
	}

	private async compact(name: string, doc: Y.Doc | null): Promise<void> {
		if (!doc) {
			doc = new Y.Doc();

			const snapshot = await this.docCache.get<string>(name);
			if (snapshot) Y.applyUpdate(doc, this.decode(snapshot));

			const updates = (await this.updateCache.get<string[]>(name)) ?? [];
			for (const u of updates) Y.applyUpdate(doc, this.decode(u));
		}

		const merged = Y.encodeStateAsUpdate(doc);
		await this.docCache.set(name, this.encode(merged));
		await this.updateCache.delete(name);
	}

	async getDoc(name: string): Promise<Y.Doc | null> {
		const snapshot = await this.docCache.get<string>(name);
		if (!snapshot) return null;

		const doc = new Y.Doc();
		Y.applyUpdate(doc, this.decode(snapshot));

		const updates = (await this.updateCache.get<string[]>(name)) ?? [];
		for (const u of updates) Y.applyUpdate(doc, this.decode(u));

		return doc;
	}

	async listDocs(): Promise<string[]> {
		return this.docCache.keys("*");
	}

	async deleteDoc(name: string): Promise<void> {
		await Promise.all([
			this.docCache.delete(name),
			this.updateCache.delete(name),
		]);
	}

	async checkHealth(): Promise<void> {
		await this.docCache.healthCheck();
	}
}

export const persistencePlugin = new Elysia({ name: "persistence" })
	.state("persistence", null as YjsPersistence | null)
	.onStart(async ({ store }) => {
		try {
			if (store.persistence) return;
			const persistence = new YjsPersistence();
			await persistence.checkHealth();
			store.persistence = persistence;
			log.info("server", "📦 Yjs persistence ready");
		} catch (err) {
			log.warn({
				...{ error: err },
				message: "⚠️  Redis unavailable — running without persistence",
			});
			store.persistence = null;
		}
	})
	.derive(({ store }) => ({ persistence: store.persistence }));
