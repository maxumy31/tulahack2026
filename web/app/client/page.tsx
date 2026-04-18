'use client'


import { useEffect, useRef, useState } from "react";
import OperatorMessage from "./components/OperatorMessage";
import SendMessageButton from "./components/SendMessageButton";
import UserMessage from "./components/UserMessage";
import { CloseTask, GetAllMessages, SendUserMessage, StartNewChatSession } from "@/server/Chat";
import { useRouter } from "next/navigation";
import WaitingMessage from "./../components/WaitingMessage";


export default function ClientPage({ }) {

    const router = useRouter();
    async function navigateBack() {
        router.push("/");
    }

    async function OnTaskSolve() {
        CloseTask(chatState.session);
        navigateBack();
    }

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

    const CreateAndLoadChat = async () => {
        const session = await StartNewChatSession();
        const chat = await GetAllMessages(session);
        setChatState({
            session: session,
            chat: chat
        });
    }

    const FastPollMessages = async () => {
        const chat = await GetAllMessages(chatState.session);
        setChatState({
            session: chatState.session,
            chat: chat
        });
    }

    const OnMessageSend = async () => {
        const messageValue = messageInputRef.current?.value;
        if (!messageValue || messageValue.trim() === "") return;

        if (messageInputRef.current) {
            messageInputRef.current.value = "";
        }

        await SendUserMessage(messageValue, chatState.session);
        await FastPollMessages();
    }

    const [chatState, setChatState] = useState<{ chat: ChatMessage[], session: string }>({
        chat: [],
        session: ""
    });

    console.log(chatState);

    const messageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        CreateAndLoadChat();
        return () => {
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
        }
    }, [])

    useEffect(() => {
        if (chatState.session) {
            pollingTimeoutRef.current = setTimeout(LongPollMessages, 3000);
        }
    }, [chatState.session]);

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="border border-primary w-full max-w-[600px] h-[800px] rounded-[20px] flex flex-col bg-base-200 overflow-hidden">
                    <div className="p-4 bg-primary text-primary-content flex flex-row justify-between">
                        <div onClick={navigateBack} className="flex flex-row gap-4 hover:cursor-pointer">
                            <svg className="ml-1" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                            </svg>
                            Назад
                        </div>

                        <div className="flex flex-row gap-4 hover:cursor-pointer" onClick={OnTaskSolve}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                <path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z" />
                            </svg>
                            Моя проблема решена
                        </div>

                    </div>


                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                        {
                            chatState.chat.map((msg) => {
                                switch (msg.from) {
                                    case "client":
                                        return <UserMessage content={msg.content} key={msg.id} />
                                    default:
                                        return <OperatorMessage content={msg.content} key={msg.id} />
                                }
                            })
                        }
                        {
                            chatState.chat.length > 0 && chatState.chat[chatState.chat.length - 1].from === 'client'
                                ? <WaitingMessage content="Сейчас ваш запрос обработает оператор" />
                                : <></>
                        }
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-base-300 bg-base-100">
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                ref={messageInputRef}
                                type="text"
                                placeholder="Напишите сообщение..."
                                className="input flex-1"
                            />
                            <SendMessageButton onClick={OnMessageSend} />
                        </form>
                    </div>

                </div>
            </div >
        </>
    );
}