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
    const stats = await db
        .select({
            status: chatSessions.status,
            count: count(chatSessions.id),
        })
        .from(chatSessions)
        .where(eq(chatSessions.isClosed, true))
        .groupBy(chatSessions.status);

    // Преобразуем ответ в нужный вам формат
    const botClosed = stats.find(s => s.status === 'bot')?.count || 0;
    const humanClosed = stats.find(s => s.status === 'operator')?.count || 0;

    console.log(`[SERVER] Statistics calculated via status field. Bot: ${botClosed}, Operator: ${humanClosed}`);
    
    return [
        { label: "bot", value: Number(botClosed) },
        { label: "operator", value: Number(humanClosed) }
    ];
}


export async function GetMessageCountDistribution() {
    const distribution = await db
        .select({
            label: sql<string>`sub.msg_count::text`.as('label'),
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
        .groupBy(sql`sub.msg_count`)
        .orderBy(sql`sub.msg_count ASC`);

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

export async function GetComplexityDistribution() {
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

export async function GetBotResolvedDistribution() {
  try {
    const distribution = await db
      .select({
        complexity: chatSessions.complexity,
        count: count(chatSessions.id),
      })
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.status, "bot"),
          eq(chatSessions.isClosed, true),
          sql`${chatSessions.complexity} BETWEEN 1 AND 10`
        )
      )
      .groupBy(chatSessions.complexity)
      .orderBy(chatSessions.complexity);

    return distribution;
  } catch (error) {
    console.error("Ошибка при получении статистики бота:", error);
    return [];
  }
}

export async function GetBotFailureRate() {
  const totalClosed = await db
    .select({ count: count() })
    .from(chatSessions)
    .where(eq(chatSessions.isClosed, true));


  const closedByOperator = await db
    .select({ count: count() })
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.isClosed, true),
        eq(chatSessions.status, "operator")
      )
    );

  const total = totalClosed[0]?.count || 0;
  const operatorCount = closedByOperator[0]?.count || 0;

  if (total === 0) return 0;

  return (Number(operatorCount) / total) * 100;
}