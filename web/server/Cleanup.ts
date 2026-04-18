import { db } from "@/db";
import { chatSessions, messagesTable } from "@/db/schema";
import { and, eq, lt, lte, notExists } from "drizzle-orm";

let lastRun = 0;

export async function LazyCleanup() {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);

    if (now - lastRun < ONE_HOUR) return;

    lastRun = now;

    console.log('Запуск фоновой очистки...');
    await db.delete(chatSessions).where(
        notExists(
            db.select().from(messagesTable)
                .where(eq(messagesTable.sessionId, chatSessions.id))
        )
    );

    await db.update(chatSessions)
        .set({ isClosed: true })
        .where(
            and(
                eq(chatSessions.isClosed, false),
                lte(chatSessions.updatedAt, ONE_HOUR_AGO)
            )
        );
}