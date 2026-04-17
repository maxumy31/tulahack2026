'use client'


import { useEffect, useRef, useState } from "react";
import OperatorMessage from "./components/OperatorMessage";
import SendMessageButton from "./components/SendMessageButton";
import UserMessage from "./components/UserMessage";
import { GetAllMessages, SendUserMessage, StartNewChatSession } from "@/server/Chat";
import { useRouter } from "next/navigation";
import WaitingMessage from "./components/WaitingMessage";


export default function ClientPage({ }) {

    const router = useRouter();
    async function navigateBack() {
        router.push("/");
    }

    const CreateAndLoadChat = async () => {
        const session = await StartNewChatSession();
        const chat = await GetAllMessages(session);
        setChatState({
            session: session,
            chat: chat
        });
    }

    const PollMessages = async () => {
        const chat = await GetAllMessages(chatState.session);
        setChatState({
            session: chatState.session,
            chat: chat
        });
    }

    const OnMessageSent = async () => {
        const messageValue = messageInputRef.current?.value;
        if (!messageValue || messageValue.trim() === "") return;

        if (messageInputRef.current) {
            messageInputRef.current.value = "";
        }

        await SendUserMessage(messageValue, "123");
        await PollMessages();
    }

    const [chatState, setChatState] = useState<{ chat: ChatMessage[], session: string }>({
        chat: [],
        session: ""
    });

    console.log(chatState);

    const messageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        CreateAndLoadChat();
    }, [])

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="border border-primary w-full max-w-[600px] h-[800px] rounded-[20px] flex flex-col bg-base-200 overflow-hidden">

                    <div onClick={navigateBack} className="p-4 bg-primary text-primary-content">
                        <svg className="ml-1 hover:scale-120 transition duration-200" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                            <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                        </svg>
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
                            chatState.chat.length > 0 && chatState.chat[chatState.chat.length-1].from === 'client'
                                ? <WaitingMessage/>
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
                            <SendMessageButton onClick={OnMessageSent} />
                        </form>
                    </div>

                </div>
            </div >
        </>
    );
}