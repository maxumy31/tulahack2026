'use client'

import { GetAllActiveSessions } from "@/server/Chat"
import { useEffect, useState } from "react";

export default function ChatSidebar({onChatSelect} : ChatSidebarProps) {

    async function GetActiveSessions() {
        const session = await GetAllActiveSessions();
        setSessions(session);
    }

    const [sessions, setSessions] = useState<string[]>();

    useEffect(() => {
        GetActiveSessions();
    }, [])

    return (<>
        <aside className="w-1/3 flex flex-col bg-base-100">

            <div className="p-3 bg-primary flex justify-around text-xs font-bold text-primary-content uppercase tracking-wider">
                <button className="hover:bg-primary-focus p-2 rounded transition">Активные</button>
                <button className="opacity-70 hover:opacity-100 p-2 transition">История</button>
                <button className="opacity-70 hover:opacity-100 p-2 transition">Боты</button>
            </div>

            <div className="p-4 border-b border-base-200 border-r border-base-300">
                <input
                    type="text"
                    placeholder="Поиск..."
                    className="input input-sm w-full bg-base-200"
                />
            </div>

            <div className="flex-1 overflow-y-auto border-r border-base-300">
                {
                    sessions?.map(session => {
                        return (
                            <div key={session} className="flex items-center p-4 gap-3 hover:bg-base-200 cursor-pointer transition border-b border-base-200">
                                <div className="avatar placeholder">
                                </div>
                                <div className="flex-1 overflow-hidden" onClick={() => onChatSelect(session)}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold truncate text-sm">{session}</h3>
                                        <span className="text-[10px] opacity-50">12:45</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </aside>
    </>)
}

interface ChatSidebarProps {
    onChatSelect: (session: string) => void,
}