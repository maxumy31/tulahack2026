'use server'

import { db } from "@/db/index"; // Укажите путь к вашему файлу подключения к БД
import { chatSessions, messagesTable } from "@/db/schema"; // Укажите путь к схеме
import { eq, asc, count, and, desc } from "drizzle-orm";
import { GetRagResponse } from "./Rag";
import { LazyCleanup } from "./Cleanup";
import { GetUseBot } from "./BotState";

//setTimeout(LazyCleanup, 1000);

export async function StartNewChatSession() {
    const [newSession] = await db
        .insert(chatSessions)
        .values({
            status:"bot"
        })
        .returning({ id: chatSessions.id });

    console.log(`[SERVER] Starting new database session with id : ${newSession.id}`);
    return String(newSession.id);
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

    const needOperator = await CheckNeedConnectToOperator(session);
    if (needOperator) {
        ConnectOperator(session);
    }

    const isBot = await IsBotSession(session);
    if (isBot && !needOperator) {
        const [response, images] = await GetRagResponse(content);
        console.log(images);
        SendBotMessage(response, session, images);
    }

    return newMsg;
}

async function CheckNeedConnectToOperator(session: string) {
    const ragUsed = await GetUseBot();

    if (!ragUsed) {
        return true;
    }

    console.log(`[SERVER] Rag used ${ragUsed}`);

    const maxMessageCountBeforeOperator = 3;

    const sessionData = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, session),
    });

    if (sessionData?.isClosed) {
        return false;
    }

    const messageCountResult = await db
        .select({
            count: count(messagesTable.id),
        })
        .from(messagesTable)
        .where(
            eq(messagesTable.sessionId, session)
        )

    const totalMessages = Number(messageCountResult[0]?.count || 0);

    return totalMessages > maxMessageCountBeforeOperator;
}

async function ConnectOperator(session: string) {
    await db.update(chatSessions)
        .set({ "status": "operator" })
        .where(eq(chatSessions.id, session));
}

async function IsBotSession(session: string) {
    const sessionData = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, session),
    });
    return sessionData?.status === 'bot';
}

async function SendBotMessage(content: string, session: string, imageIds?: string[]) {
    const [newMsg] = await db
        .insert(messagesTable)
        .values({
            sessionId: session,
            content: content,
            from: "bot",
            imageIds: imageIds ? JSON.stringify(imageIds) : null,
        })
        .returning();
    console.log(`[SERVER] Bot message added to session: ${session}. Images : ${imageIds}`);
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

export async function GetAllWaitingSessions() {
    const allSessions = await db.select()
        .from(chatSessions)
        .where(
            and(eq(chatSessions.isClosed, false)
                , eq(chatSessions.status, "operator"))
        )
        .orderBy(desc(chatSessions.updatedAt));
    console.log(`[SERVER] Fetched all waiting sessions. Total: ${allSessions.length}`);
    return allSessions.map(s => s.id);
}

export async function GetAllBotSessions() {
    const allSessions = await db.select()
        .from(chatSessions)
        .where(
            and(eq(chatSessions.isClosed, false)
                , eq(chatSessions.status, "bot"))
        )
        .orderBy(desc(chatSessions.updatedAt));
    console.log(`[SERVER] Fetched all bot sessions. Total: ${allSessions.length}`);
    return allSessions.map(s => s.id);
}

export async function GetAllClosedSessions() {
    const allSessions = await db.select()
        .from(chatSessions)
        .where(
            eq(chatSessions.isClosed, true)
        )
        .orderBy(desc(chatSessions.updatedAt));
    console.log(`[SERVER] Fetched all closed sessions. Total: ${allSessions.length}`);
    return allSessions.map(s => s.id);
}

export async function CloseTask(session: string) {
    const messageCountResult = await db
        .select({ count: count() })
        .from(messagesTable)
        .where(eq(messagesTable.sessionId, session));

    const totalMessages = messageCountResult[0]?.count || 0;
    
    const calculatedComplexity = Math.min(10, Math.max(1, Math.ceil(totalMessages / 2)));

    await db.update(chatSessions)
        .set({ 
            isClosed: true, 
            complexity: calculatedComplexity 
        })
        .where(eq(chatSessions.id, session));
}

export async function GetAllMessages(session: string): Promise<ChatMessage[]> {
    if (session === "") return [];

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
            imageIds: msg.imageIds ? JSON.parse(msg.imageIds) : undefined,
        };
    });
}

export async function RequestOperator(session: string, complexity: number) {
    await db.update(chatSessions)
        .set({ status: "operator", complexity: complexity })
        .where(eq(chatSessions.id, session));

    console.log("[SERVER] Update result:", session, " ", complexity);

    const [newMsg] = await db
        .insert(messagesTable)
        .values({
            sessionId: session,
            content: `[SYSTEM] Клиент запросил оператора. Сложность задачи: ${complexity}/10`,
            from: "system",
        })
        .returning();

    console.log(`[SERVER] Operator requested for session: ${session}, complexity: ${complexity}`);
    return newMsg;
}