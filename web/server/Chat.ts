'use server'

import { db } from "@/db/index"; // Укажите путь к вашему файлу подключения к БД
import { chatSessions, messagesTable } from "@/db/schema"; // Укажите путь к схеме
import { eq, asc } from "drizzle-orm";

export async function StartNewChatSession() {
    const [newSession] = await db
    .insert(chatSessions)
    .values({})
    .returning({ id: chatSessions.id });
    
    console.log(`[SERVER] Starting new database session with id : ${newSession.id}`);
    return newSession.id;
}

export async function SendUserMessage(content: string, session: string) {
    const [newMsg] = await db
        .insert(messagesTable)
        .values({
            sessionId: session,
            content: content,
            from: "client",
        })
        .returning();

    console.log(`[SERVER] User message added to session: ${session}`);

    const [isBot] = await db.select()
        .from(chatSessions)
        .where(chat => eq(chat.status, "bot"))
        .limit(1);

        
    return newMsg;
}

export async function SendOperatorMessage(content: string, session: string) {
    const [newMsg] = await db
        .insert(messagesTable)
        .values({
            sessionId: session,
            content: content,
            from: "operator",
        })
        .returning();

    console.log(`[SERVER] Operator message added to session: ${session}`);
    return newMsg;
}

export async function GetAllActiveSessions() {
    const allSessions = await db.select().from(chatSessions);
    console.log(`[SERVER] Fetched all sessions. Total: ${allSessions.length}`);
    return allSessions.map(s => s.id);
}

export async function GetAllMessages(session: string): Promise<ChatMessage[]> {
    const chatHistory = await db.query.messagesTable.findMany({
        where: eq(messagesTable.sessionId, session),
        orderBy: asc(messagesTable.createdAt),
    });

    console.log(`[SERVER] Fetched ${chatHistory.length} messages for session: ${session}`);

    return chatHistory.map((msg): ChatMessage => {
        return {
            id: msg.id,
            content: msg.content,
            from: msg.from as MessageOwner, 
            time: msg.createdAt,
        };
    });
}