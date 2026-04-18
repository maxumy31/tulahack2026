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

    return (
        <>
            <div className="min-h-screen bg-base-100">
                <OperatorHeader
                    headers={["Чат", "Статистика"]} 
                    activeHeader="Чат"
                    onTabClick={(tab) => {OnHeaderTabClick(tab)}}
                    />
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