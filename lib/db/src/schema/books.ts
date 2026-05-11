import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull().default("beginner"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  totalPages: integer("total_pages").notNull().default(100),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
