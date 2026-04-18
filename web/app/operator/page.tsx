'use client'


import { useEffect, useRef, useState } from "react";
import OperatorMessage from "./components/OperatorMessage";
import SendMessageButton from "./components/SendMessageButton";
import UserMessage from "./components/UserMessage";
import { GetAllMessages, SendUserMessage, StartNewChatSession } from "@/server/Chat";
import { useRouter } from "next/navigation";
import WaitingMessage from "../components/WaitingMessage";
import Chat from "./components/Chat";
import ChatSidebar from "./components/ChatSidebar";


export default function ClientPage({ }) {

    const [activeChatSession, setActiveChatSession] = useState<string>("");

    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-base-300 p-4">
                <div className="flex w-full max-w-[1600px] h-[900px] rounded-[20px] bg-base-200 overflow-hidden">

                    <ChatSidebar onChatSelect={(session) => setActiveChatSession(session)}/>
                    <Chat session={activeChatSession} role="operator" canInteract/>

                </div>
            </div>
        </>
    );
}