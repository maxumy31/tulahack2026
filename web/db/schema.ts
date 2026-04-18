import { pgTable, serial, text, timestamp, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Определяем возможные состояния обработки
export const chatStatusEnum = pgEnum("chat_status", ["bot", "operator"]);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: chatStatusEnum("status").default("bot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  isClosed: boolean().default(false),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => chatSessions.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  from: text("from").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(messagesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  session: one(chatSessions, {
    fields: [messagesTable.sessionId],
    references: [chatSessions.id],
  }),
}));