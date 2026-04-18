'use server'

import { db } from "@/db";
import { chatSessions, messagesTable } from "@/db/schema";
import { count } from "console";
import { desc, eq, sql } from "drizzle-orm";


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
    const RANGES = {
        '1': 1,
        '2-3': 3,
        '3-5': 5,
        '5-8': 8,
        '8+': Infinity,
    };

    const caseSql = Object.entries(RANGES).reduce((acc, [label, limit], index, arr) => {
        const prevLimit = index === 0 ? 0 : arr[index - 1][1];
        if (limit === Infinity) {
            return `${acc} ELSE '${label}' `;
        }
        return `${acc} WHEN sub.msg_count > ${prevLimit} AND sub.msg_count <= ${limit} THEN '${label}' `;
    }, 'CASE');

    // Исправление: используем sql`count(*)` вместо импортированного count()
    const distribution = await db
        .select({
            range: sql<string>`${sql.raw(caseSql)} END`.as('range'),
            count: sql<number>`count(*)`.mapWith(Number).as('count')
        })
        .from(
            db.select({
                msg_count: sql<number>`count(*)`.mapWith(Number).as('msg_count')
            })
            .from(messagesTable)
            .groupBy(messagesTable.sessionId)
            .as('sub')
        )
        .groupBy(sql`range`)
        .orderBy(sql`MIN(sub.msg_count)`);

    return distribution.map(item => ({
        label: item.range,
        value: item.count
    }));
}