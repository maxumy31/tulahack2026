'use client'


import { useEffect, useRef, useState } from "react";
import OperatorMessage from "./components/OperatorMessage";
import SendMessageButton from "./components/SendMessageButton";
import UserMessage from "./components/UserMessage";
import { GetAllMessages, SendUserMessage, StartNewChatSession } from "@/server/Chat";
import { redirect, useRouter } from "next/navigation";
import WaitingMessage from "../components/WaitingMessage";
import Chat from "./components/Chat";
import ChatSidebar from "./components/ChatSidebar";


export default function ClientPage({ }) {

    async function navigateToDashboard() {
        redirect("/dashboard");
      }


    const [activeChatSession, setActiveChatSession] = useState<string>("");

    return (
        <>
            <div className="min-h-screen bg-base-300">
                <div className="flex flex-row justify-center gap-16 py-1 bg-base-100 border-b">
                    <div className="px-8 py-3 text-black underline">
                        Чат
                    </div>
                    <div 
                        onClick={navigateToDashboard}
                        className="px-8 py-3 text-black hover:underline transition duration-500">
                        Статистика
                    </div>
                </div>
                <div className="flex justify-center items-start">
                    <div className="flex w-full max-w-[1600px] h-[800px] rounded-[20px] overflow-hidden border border-primary mt-8">

                        <ChatSidebar
                            onTabSelect={(tab) => { setActiveChatSession("") }}
                            onChatSelect={(session) => setActiveChatSession(session)} />
                        <Chat
                            session={activeChatSession}
                            role="operator"
                            canInteract />

                    </div>
                </div>
            </div>

        </>
    );
}