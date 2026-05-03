import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import * as Y from "yjs";

const MAX_UPDATES_BEFORE_COMPACT = 100;

export class YjsPersistence {
  private docCache: RedisCache;
  private updateCache: RedisCache;

  constructor() {
    this.docCache = new RedisCache("yjsdoc", 60 * 60 * 24 * 90);  // 90 days
    this.updateCache = new RedisCache("yjsupd", 60 * 60 * 24 * 30); // 30 days
  }

  // ── Binary <-> base64 helpers ──────────────────────────────────────────
  // RedisCache stores strings/JSON, so we base64-encode Yjs binary data

  private encode(data: Uint8Array): string {
    return Buffer.from(data).toString("base64");
  }

  private decode(data: string): Uint8Array {
    return new Uint8Array(Buffer.from(data, "base64"));
  }

  // ── Core methods ───────────────────────────────────────────────────────

  /**
   * Called when a room opens.
   * Loads the saved snapshot + any pending incremental updates into the doc,
   * then subscribes to future updates for autosave.
   */
  async bindState(name: string, doc: Y.Doc): Promise<void> {
    // 1. Apply the last compacted snapshot if it exists
    const snapshot = await this.docCache.get<string>(name);
    if (snapshot) {
      Y.applyUpdate(doc, this.decode(snapshot));
    }

    // 2. Apply any incremental updates that came in after the last compact
    const updates = await this.updateCache.get<string[]>(name) ?? [];
    for (const u of updates) {
      Y.applyUpdate(doc, this.decode(u));
    }

    // 3. Compact immediately if too many pending updates were loaded
    if (updates.length >= MAX_UPDATES_BEFORE_COMPACT) {
      await this.compact(name, doc);
    }

    // 4. Subscribe: every future Yjs update gets persisted
    doc.on("update", async (update: Uint8Array) => {
      await this.storeUpdate(name, update);
    });
  }

  /**
   * Appends one incremental Yjs update to Redis.
   * Triggers a compact if the update list gets too long.
   */
  async storeUpdate(name: string, update: Uint8Array): Promise<void> {
    const existing = await this.updateCache.get<string[]>(name) ?? [];
    existing.push(this.encode(update));
    await this.updateCache.set(name, existing);

    if (existing.length >= MAX_UPDATES_BEFORE_COMPACT) {
      await this.compact(name, null);
    }
  }

  /**
   * Force-saves the full document state.
   * Call this on explicit save, room close, or periodic flush.
   */
  async writeState(name: string, doc: Y.Doc): Promise<void> {
    await this.compact(name, doc);
  }

  /**
   * Merges all incremental updates into a single snapshot.
   * Deletes the updates list after snapshotting.
   */
  private async compact(name: string, doc: Y.Doc | null): Promise<void> {
    // If no live doc provided, reconstruct one from Redis
    if (!doc) {
      doc = new Y.Doc();

      const snapshot = await this.docCache.get<string>(name);
      if (snapshot) Y.applyUpdate(doc, this.decode(snapshot));

      const updates = await this.updateCache.get<string[]>(name) ?? [];
      for (const u of updates) Y.applyUpdate(doc, this.decode(u));
    }

    // Write merged snapshot, clear the updates list
    const merged = Y.encodeStateAsUpdate(doc);
    await this.docCache.set(name, this.encode(merged));
    await this.updateCache.delete(name);
  }

  // ── Utility methods ────────────────────────────────────────────────────

  /** Reconstruct a Y.Doc from Redis — used by the export REST route */
  async getDoc(name: string): Promise<Y.Doc | null> {
    const snapshot = await this.docCache.get<string>(name);
    if (!snapshot) return null;

    const doc = new Y.Doc();
    Y.applyUpdate(doc, this.decode(snapshot));

    const updates = await this.updateCache.get<string[]>(name) ?? [];
    for (const u of updates) Y.applyUpdate(doc, this.decode(u));

    return doc;
  }

  /** List all persisted document names */
  async listDocs(): Promise<string[]> {
    return this.docCache.keys("*");
  }

  /** Wipe a document from Redis entirely */
  async deleteDoc(name: string): Promise<void> {
    await Promise.all([
      this.docCache.delete(name),
      this.updateCache.delete(name),
    ]);
  }
}

// ── Elysia plugin ──────────────────────────────────────────────────────────

let persistence: YjsPersistence | null = null;

export const persistencePlugin = new Elysia({ name: "persistence" })
  .decorate("store", {} as { persistence: YjsPersistence | null })
  .onStart(async ({ store }) => {
    try {
      persistence = new YjsPersistence();
      await persistence["docCache"].healthCheck();
      store.persistence = persistence;
      console.log("📦 Yjs persistence ready");
    } catch (err) {
      console.warn("⚠️  Redis unavailable — running without persistence:", err);
      store.persistence = null;
    }
  })
  .derive(({ store }) => ({
    persistence: store.persistence,
  }));

export { persistence };
