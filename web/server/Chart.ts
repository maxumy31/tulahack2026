'use server'

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";


export async function CountAllSessions() {
    const allSessions = await db.select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));
    
    console.log(`[SERVER] Fetched all sessions. Total: ${allSessions.length}`);
    return allSessions.map(s => s.id);
}

export async function CountAllOpenSessions() {
    const openSessions = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.isClosed, false))
        .orderBy(desc(chatSessions.updatedAt));
    
    console.log(`[SERVER] Fetched all open sessions. Total: ${openSessions.length}`);
    return openSessions.map(s => s.id);
}

export async function CountAllClosedSessions() {
    const closedSessions = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.isClosed, true))
        .orderBy(desc(chatSessions.updatedAt));
    
    console.log(`[SERVER] Fetched all closed sessions. Total: ${closedSessions.length}`);
    return closedSessions.map(s => s.id);
}