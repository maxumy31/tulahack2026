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
import OperatorHeader from "../components/OperatorHeader";
import Cookies from "js-cookie";

export default function ClientPage({ }) {

    async function navigateToDashboard() {
        redirect("/dashboard");
    }

    async function OnHeaderTabClick(tab : string) {
        if(tab === 'Статистика') {
            navigateToDashboard();
        }
    }

    const [activeChatSession, setActiveChatSession] = useState<string>("");
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const [sidebarKey, setSidebarKey] = useState<number>(0);

    return (
        <>
            <div className="min-h-screen bg-base-100">
                <OperatorHeader
                    headers={["Чат", "Статистика"]} 
                    activeHeader="Чат"
                    />
                <div className="flex justify-center items-start">
                    <div className="flex w-full max-w-[1400px] h-[800px] rounded-[20px] overflow-hidden border border-primary mt-8">

                        <ChatSidebar
                            key={sidebarKey}
                            onTabSelect={(tab) => { setActiveChatSession(""); setIsClosed(false); }}
                            onChatSelect={(session, closed) => { setActiveChatSession(session); setIsClosed(closed || false); }} />
                        <Chat
                            session={activeChatSession}
                            role="operator"
                            canInteract
                            onChatClose={() => setSidebarKey(k => k+1)}
                            isClosed={isClosed} />
                    </div>
                </div>
            </div>

        </>
    );
}