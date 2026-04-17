'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import UserMessage from "./UserMessage";
import OperatorMessage from "./OperatorMessage";
import WaitingMessage from "./WaitingMessage";
import SendMessageButton from "./SendMessageButton";
import { GetAllMessages, SendUserMessage, SendOperatorMessage, StartNewChatSession } from "@/server/Chat";

interface ChatProps {
    session?: string;
    canInteract?: boolean;
    role: 'client' | 'operator';
}

export default function Chat({ session: initialSession, canInteract = true, role }: ChatProps) {
    const router = useRouter();
    const messageInputRef = useRef<HTMLInputElement>(null);
    
    const [chatState, setChatState] = useState<{ chat: ChatMessage[], session: string }>({
        chat: [],
        session: initialSession || ""
    });

    const initChat = async () => {
        let currentSession = chatState.session;
        console.log(currentSession);

        if (role === 'client' && !currentSession) {
            currentSession = await StartNewChatSession();
        }

        if (currentSession) {
            const messages = await GetAllMessages(currentSession);
            setChatState({ session: currentSession, chat: messages });
        }
    };

    const pollMessages = async () => {
        if (!chatState.session) return;
        const messages = await GetAllMessages(chatState.session);
        console.log(chatState);
        setChatState(prev => ({ ...prev, chat: messages }));
    };

    const handleSendMessage = async () => {
        const messageValue = messageInputRef.current?.value;
        console.log(!messageValue, chatState.session);

        if (!messageValue || messageValue.trim() === "" || !chatState.session) return;

        console.log(messageValue);
        
        if (messageInputRef.current) messageInputRef.current.value = "";

        if (role === 'client') {
            await SendUserMessage(messageValue, chatState.session);
        } else {
            await SendOperatorMessage(messageValue, chatState.session);
        }

        await pollMessages();
    };

    useEffect(() => {
        initChat();
    }, [initialSession]);

    return (
        <div className={clsx(
            "flex flex-col w-full",
            role === 'client' ? "justify-center items-center min-h-screen" : "h-full"
        )}>
            <div className={clsx(
                "flex flex-col bg-base-200 overflow-hidden",
                role === 'client' ? "border border-primary w-full max-w-[600px] h-[800px] rounded-[20px]" : "flex-1"
            )}>
                
                <div className="p-4 bg-primary text-primary-content flex items-center gap-4">
                    {role === 'client' ? (
                        <div onClick={() => router.push("/")} className="cursor-pointer">
                            <svg className="hover:scale-120 transition duration-200" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="font-bold">Чат с пользователем</div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                    {chatState.chat.map((msg) => (
                        msg.from === "client" 
                            ? <UserMessage content={msg.content} key={msg.id} />
                            : <OperatorMessage content={msg.content} key={msg.id} />
                    ))}
                    
                    {chatState.chat.length > 0 && chatState.chat[chatState.chat.length - 1].from === 'client' && (
                        <WaitingMessage />
                    )}
                </div>

                {canInteract && (
                    <div className="p-4 border-t border-base-300 bg-base-100">
                        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                            <input
                                ref={messageInputRef}
                                type="text"
                                placeholder="Напишите сообщение..."
                                className="input input-bordered flex-1"
                            />
                            <SendMessageButton onClick={() => {}} />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}