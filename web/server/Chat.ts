import { randomInt } from "crypto";

let chat: ChatMessage[] = []
let activeSession = "session_id_test"


export async function StartNewChatSession() {
    chat = [];
    return activeSession;
}

export async function SendUserMessage(content: string, session: string) {
    const newMsg: ChatMessage = {
        id: chat.length,
        content: content,
        from: "client",
        time: new Date(),
    }
    chat.push(newMsg);
    return newMsg;
}

export async function SendMessage(content: string, session: string, from: MessageOwner) {
    const newMsg: ChatMessage = {
        id: chat.length,
        content: content,
        from: from,
        time: new Date(),
    }
    chat.push(newMsg);
    return newMsg;
}

export async function SendOperatorMessage(content: string, session: string) {
    const newMsg: ChatMessage = {
        id: chat.length,
        content: content,
        from: "operator",
        time: new Date(),
    }
    chat.push(newMsg);
    return newMsg;
}

export async function GetAllActiveSessions() {
    return [activeSession];
}

export async function GetAllMessages(session: string) {
    return chat;
}
