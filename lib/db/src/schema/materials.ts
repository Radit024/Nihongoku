import { pgTable, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const materialsTable = pgTable("materials", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  classCode: varchar("class_code", { length: 24 }).notNull(),
  description: text("description").notNull().default(""),
  lessonContent: text("lesson_content").notNull(),
  sourceFileName: varchar("source_file_name", { length: 255 }).notNull().default(""),
  sourceMimeType: varchar("source_mime_type", { length: 120 }).notNull().default("application/octet-stream"),
  isPublished: boolean("is_published").notNull().default(false),
  questionCount: integer("question_count").notNull().default(10),
  createdById: text("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({ id: true, createdAt: true });
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;
