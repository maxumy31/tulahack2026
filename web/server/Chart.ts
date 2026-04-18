'use server'

import { db } from "@/db";
import { chatSessions, messagesTable } from "@/db/schema";
import { and, avg, count, desc, eq, sql } from "drizzle-orm";


export async function CountAllSessions() {
    const allSessions = await db.select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));

    console.log(`[SERVER] Fetched all sessions. Total: ${allSessions.length}`);
    return allSessions.length;
}

export async function CountAllOpenSessions() {
    const openSessions = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.isClosed, false))
        .orderBy(desc(chatSessions.updatedAt));

    console.log(`[SERVER] Fetched all open sessions. Total: ${openSessions.length}`);
    return openSessions.length;
}

export async function CountAllClosedSessions() {
    const closedSessions = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.isClosed, true))
        .orderBy(desc(chatSessions.updatedAt));

    console.log(`[SERVER] Fetched all closed sessions. Total: ${closedSessions.length}`);
    return closedSessions.length;
}

export async function GetClosingStats() {
    const closedSessions = await db.select().from(chatSessions).where(eq(chatSessions.isClosed, true));

    let botClosed = 0;
    let humanClosed = 0;

    for (const session of closedSessions) {
        const messages = await db.select().
            from(messagesTable).
            where(
                eq(messagesTable.sessionId, session.id)
            );
        const hasOperator = messages.some(m => m.from === 'operator');

        if (hasOperator) humanClosed++;
        else botClosed++;
    }
    console.log(`[SERVER] Getting close statistics. Total: ${closedSessions.length}`);
    return [
        { label: "bot", value: botClosed },
        { label: "operator", value: humanClosed }
    ];
}


export async function GetMessageCountDistribution() {
    const labelColumn = sql<string>`CASE 
        WHEN sub.msg_count = 1 THEN '1'
        WHEN sub.msg_count BETWEEN 2 AND 3 THEN '2-3'
        WHEN sub.msg_count BETWEEN 4 AND 5 THEN '4-5'
        WHEN sub.msg_count BETWEEN 6 AND 8 THEN '6-8'
        ELSE '8+'
    END`;

    const distribution = await db
        .select({
            label: labelColumn.as('label'),
            value: sql<number>`count(*)`.mapWith(Number).as('value'),
        })
        .from(
            db.select({
                msg_count: sql<number>`count(*)`.mapWith(Number).as('msg_count')
            })
                .from(messagesTable)
                .groupBy(messagesTable.sessionId)
                .as('sub')
        )
        .groupBy(labelColumn)
        .orderBy(sql`MIN(sub.msg_count)`);

    return distribution;
}

export async function GetDailyCreatedSessionsCount() {
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatSessions)
        .where(sql`DATE(created_at) = CURRENT_DATE`);

    return result[0]?.count || 0;
}

export async function GetDailyClosedSessionsCount() {
    // 1. Используем методы Drizzle: eq() для булева значения
    // 2. Используем sql только для работы с датами, где это необходимо
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatSessions)
        .where(
            and(
                eq(chatSessions.isClosed, true),
                sql`DATE(${chatSessions.updatedAt}) = CURRENT_DATE`
            )
        );

    // Дополнительная проверка на null
    const countValue = result[0]?.count;
    return Number(countValue || 0);
}

export async function GetAverageChatLength() {
    const result = await db
        .select({
            avgLength: avg(sql<number>`sub.msg_count`)
        })
        .from(
            db.select({
                msg_count: count(messagesTable.id).as('msg_count')
            })
            .from(messagesTable)
            .innerJoin(chatSessions, eq(messagesTable.sessionId, chatSessions.id))
            .where(eq(chatSessions.isClosed, true))
            .groupBy(messagesTable.sessionId)
            .as('sub')
        );

    const average = parseFloat(result[0]?.avgLength || '0');
    return average.toFixed(1);
}

export async function getComplexityDistribution() {
  try {
    const distribution = await db
      .select({
        complexity: chatSessions.complexity,
        count: count(chatSessions.id),
      })
      .from(chatSessions)
      .where(sql`${chatSessions.complexity} BETWEEN 1 AND 10`)
      .groupBy(chatSessions.complexity)
      .orderBy(chatSessions.complexity);

    return distribution;
  } catch (error) {
    console.error("Ошибка при получении распределения:", error);
    return [];
  }
}