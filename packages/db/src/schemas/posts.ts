import { pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { user } from './auth';

export const post = pgTable('post', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  createdBy: t
    .text()
    .references(() => user.id)
    .notNull(),
}));

export const CreatePostSchema = v.omit(
  createInsertSchema(post, {
    title: v.pipe(v.string(), v.maxLength(256)),
    content: v.pipe(v.string(), v.maxLength(512)),
  }),
  ['id', 'createdAt', 'createdBy'],
);
