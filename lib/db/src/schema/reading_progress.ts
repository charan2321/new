import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const readingProgressTable = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  bookId: integer("book_id").notNull().references(() => booksTable.id),
  currentPage: integer("current_page").notNull().default(1),
  totalPages: integer("total_pages").notNull().default(100),
  percentComplete: numeric("percent_complete", { precision: 5, scale: 2 }).notNull().default("0"),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReadingProgressSchema = createInsertSchema(readingProgressTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgressTable.$inferSelect;
