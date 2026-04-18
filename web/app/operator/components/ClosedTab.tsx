'use client'

import clsx from "clsx";
import { useState } from "react";

export default function ClosedTab({ 
    sessions, 
    onChatSelect 
}: ClosedTabProps) {
    const [activeSession, setActiveSession] = useState<string>("");

    return (<>
        <div className="flex-1 overflow-y-auto border-r border-base-300">
            {
                sessions?.map(session => {
                    return (
                        <div key={session}
                            onClick={() => {
                                setActiveSession(session);
                                onChatSelect(session);
                            }}
                            className={clsx(
                                "flex items-center p-4 gap-3 hover:bg-primary cursor-pointer transition border-b border-base-200",
                                session === activeSession ? "bg-primary text-primary-content" : ""
                            )}>
                            <div className="avatar placeholder">
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="truncate text-sm">{session}</h3>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    </>)
}

interface ClosedTabProps {
    onChatSelect : (session : string) => void,
    sessions: string[]
}