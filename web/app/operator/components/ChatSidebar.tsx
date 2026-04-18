'use client'

import { GetAllBotSessions, GetAllClosedSessions, GetAllWaitingSessions } from "@/server/Chat"
import clsx from "clsx";
import { useEffect, useState } from "react";
import ActiveTab from "./ActiveTab";
import ClosedTab from "./ClosedTab";
import BotTab from "./BotTab";

export default function ChatSidebar({ onChatSelect }: ChatSidebarProps) {

    async function GetWaitingSessions() {
        const session = await GetAllWaitingSessions();
        setSessions(session);
    }

    async function GetClosedSessions() {
        const session = await GetAllClosedSessions();
        setSessions(session);
    }

    async function GetBotSessions() {
        const session = await GetAllBotSessions();
        setSessions(session);
    }

    const [sessions, setSessions] = useState<string[]>();


    type Tab = "active" | "closed" | "bot"
    const [activeTab, setActiveTab] = useState<Tab>("active");

    useEffect(() => {
        console.log(activeTab);
        switch (activeTab) {
            case "active":
                GetWaitingSessions();
                break;
            case "bot":
                GetBotSessions();
                break;
            case "closed":
                GetClosedSessions();
                break;
            default:
                console.error("Unrechable");
        }
    }, [activeTab])

    return (<>
        <aside className="w-1/3 flex flex-col bg-base-100">

            <div className="p-2 bg-primary flex justify-around text-md font-bold text-primary-content uppercase tracking-wider">
                <button
                    onClick={() => setActiveTab("active")}
                    className={clsx(
                        "p-2 rounded transition",
                        activeTab === 'active' ? "text-primary-content" : "opacity-70"
                    )}
                >
                    Активные
                </button>
                <button
                    onClick={() => setActiveTab("closed")}
                    className={clsx(
                        "p-2 rounded transition",
                        activeTab === 'closed' ? "hover:bg-primary-focus" : "opacity-70"
                    )}
                >
                    Закрытые
                </button>
                <button
                    onClick={() => setActiveTab("bot")}
                    className={clsx(
                        "p-2 rounded transition",
                        activeTab === 'bot' ? "hover:bg-primary-focus" : "opacity-70"
                    )}
                >
                    Обрабатываемые
                </button>
            </div>
            {
                activeTab === "active"
                    ? <ActiveTab
                        onChatSelect={(session) => onChatSelect(session)}
                        sessions={sessions || [""]}
                    />
                    : <></>
            }
            {
                activeTab === "closed"
                    ? <ClosedTab
                        onChatSelect={(session) => onChatSelect(session)}
                        sessions={sessions || [""]}
                    />
                    : <></>
            }
            {
                activeTab === "bot"
                    ? <BotTab
                        onChatSelect={(session) => onChatSelect(session)}
                        sessions={sessions || [""]}
                    />
                    : <></>
            }
        </aside>
    </>)
}

interface ChatSidebarProps {
    onChatSelect: (session: string) => void,
}