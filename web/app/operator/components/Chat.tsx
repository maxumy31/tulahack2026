'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import UserMessage from "./UserMessage";
import OperatorMessage from "./OperatorMessage";
import WaitingMessage from "../../components/WaitingMessage";
import SendMessageButton from "./SendMessageButton";
import { GetAllMessages, SendUserMessage, SendOperatorMessage, StartNewChatSession, CloseTask } from "@/server/Chat";

interface ChatProps {
    session?: string;
    canInteract?: boolean;
    role: 'client' | 'operator';
    isClosed?: boolean;
    onChatClose : () => void;
}

export default function Chat({ 
    session: initialSession, 
    canInteract = true, 
    role, 
    isClosed = false,
    onChatClose,
}: ChatProps) {
    const router = useRouter();
    const messageInputRef = useRef<HTMLInputElement>(null);

    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const LongPollMessages = async () => {
        try {
            const chat = await GetAllMessages(chatState.session);
            setChatState(prev => ({
                ...prev,
                chat: chat
            }));
        } catch (error) {
            console.error("Ошибка при получении сообщений:", error);
        } finally {
            if (chatState.session) {
                pollingTimeoutRef.current = setTimeout(LongPollMessages, 3000);
            }
        }
    };


    const [chatState, setChatState] = useState<{ chat: ChatMessage[], session: string }>({
        chat: [],
        session: initialSession || ""
    });

    useEffect(() => {
        let isMounted = true;

        const poll = async () => {
            if (!chatState.session || !isMounted) return;
            try {
                const messages = await GetAllMessages(chatState.session);
                if (isMounted) {
                    setChatState(prev => ({ ...prev, chat: messages }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) {
                    pollingTimeoutRef.current = setTimeout(poll, 3000);
                }
            }
        };

        if (chatState.session) {
            poll();
        }

        return () => {
            isMounted = false;
            if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        };
    }, [chatState.session]);

    useEffect(() => {
        setChatState({ chat: [], session: initialSession || "" });
        initChat();
    }, [initialSession]);

    const initChat = async () => {
        if (!initialSession) return;

        if (role === 'client' && !initialSession) {
            const newSession = await StartNewChatSession();
            return;
        }

        const messages = await GetAllMessages(initialSession);
        setChatState({ session: initialSession, chat: messages });
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

    const handleCloseTask = async () => {
        if (chatState.session) {
            await CloseTask(chatState.session);
            setChatState({
                chat: [],
                session: ""
            });
            onChatClose();
        }
    };

    return (
        <div className={clsx(
            "flex flex-col w-full bg-base-100",
            role === 'client' ? "justify-center items-center min-h-screen" : "h-full"
        )}>
            <div className={clsx(
                "flex flex-col bg-base-100 overflow-hidden",
                role === 'client' ? "border border-primary w-full max-w-[600px] h-[800px] rounded-[20px]" : "flex-1"
            )}>

                <div className="p-6 bg-primary bg-base-200 text-primary-content flex items-center justify-between">
                    <div>
                        {role === 'client' ? (
                            <button onClick={() => router.push("/")} className="cursor-pointer hover:opacity-80 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                    <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                                </svg>
                            </button>
                        ) : (
                            <div className="font-medium text-[16px] leading-[20px]">Чат с клиентом</div>
                        )}
                    </div>
                    {role === 'operator' && chatState.session && !isClosed && (
                        <button 
                            onClick={handleCloseTask}
                            className="hover:cursor-pointer hover:opacity-80 transition-opacity font-medium text-[16px] leading-[20px]"
                        >
                            Закрыть обращение
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                    {chatState.chat.map((msg) => (
                        msg.from === "client"
                            ? <UserMessage content={msg.content} key={msg.id} />
                            : <OperatorMessage content={msg.content} imageIds={msg.imageIds} key={msg.id} />
                    ))}

                    {chatState.chat.length > 0 && chatState.chat[chatState.chat.length - 1].from === 'client' && (
                        <WaitingMessage />
                    )}
                </div>

                {canInteract && (
                    <div className="p-4 border-t border-base-300 bg-base-100">
                        <div className="flex gap-2">
                            <input
                                ref={messageInputRef}
                                type="text"
                                placeholder="Напишите сообщение..."
                                className="input input-bordered flex-1"
                            />
                            <SendMessageButton onClick={() => { handleSendMessage(); }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}