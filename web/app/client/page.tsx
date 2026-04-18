'use client'


import { useEffect, useRef, useState } from "react";
import OperatorMessage from "./components/OperatorMessage";
import SendMessageButton from "./components/SendMessageButton";
import UserMessage from "./components/UserMessage";
import { CloseTask, GetAllMessages, RequestOperator, SendUserMessage, StartNewChatSession } from "@/server/Chat";
import { useRouter } from "next/navigation";
import WaitingMessage from "./../components/WaitingMessage";
import ComplexityModal from "./components/ComplexityModal";


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
            console.log("polling");
            if (chat.length !== chatState.chat.length) {
                setChatState(prev => ({
                    ...prev,
                    chat: chat
                }));
            }

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
            chat: chat,
            operatorRequested: false
        });
    }

    const FastPollMessages = async () => {
        const chat = await GetAllMessages(chatState.session);
        setChatState({
            session: chatState.session,
            chat: chat,
            operatorRequested: chatState.operatorRequested
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

    const handleRequestOperator = (complexity: number) => {
        RequestOperator(chatState.session, complexity);
        setChatState(prev => ({
            ...prev,
            operatorRequested: true
        }));
    }

    const [chatState, setChatState] = useState<{ chat: ChatMessage[], session: string, operatorRequested: boolean }>({
        chat: [],
        session: "",
        operatorRequested: false
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
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
            <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-base-300">
                <div className="w-full max-w-4xl h-screen md:h-[900px] rounded-2xl flex flex-col bg-base-100 overflow-hidden border border-base-300">

                    <div className="p-6 py-8 bg-gradient-to-r from-primary to-primary text-primary-content flex items-center justify-between">

                        <div className="flex-1">
                            <button onClick={navigateBack} className="hover:cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity text-base font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                    <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                                </svg>
                                <span>Назад</span>
                            </button>
                        </div>


                        <div className="flex-1 flex justify-center">
                            <h1 className="text-base font-bold whitespace-nowrap">Служба поддержки</h1>
                        </div>


                        <div className="flex-1 flex items-center justify-end gap-4 text-base font-medium">
                            {!chatState.operatorRequested && chatState.chat.length != 0 && (
                                <button
                                    className="hover:opacity-80 transition-opacity hover:cursor-pointer"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Вызвать оператора
                                </button>
                            )}
                            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity hover:cursor-pointer" onClick={OnTaskSolve}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                    <path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z" />
                                </svg>
                                <span>Решено</span>
                            </button>
                        </div>
                    </div>


                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-base-100">
                        {
                            chatState.chat.map((msg) => {
                                if (msg.from === 'system') return null;
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
                    <div className="p-6 border-t border-base-300 bg-base-100">
                        <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                ref={messageInputRef}
                                type="text"
                                placeholder="Напишите сообщение..."
                                className="input input-bordered flex-1 focus:outline-none focus:border-primary"
                            />
                            <SendMessageButton onClick={OnMessageSend} />
                        </form>
                    </div>

                </div>
            </div >

            <ComplexityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleRequestOperator}
            />
        </>
    );
}