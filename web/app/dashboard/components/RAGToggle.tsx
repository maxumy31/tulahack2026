'use client'

import { GetUseBot, SetUseBot } from '@/server/BotState';
import { useState, useEffect } from 'react';

export default function RAGToggle() {

    const [isRagEnabled, setIsRagEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadState() {
            const value = await GetUseBot();
            setIsRagEnabled(value);
            setIsLoading(false);
        }
        loadState();
    }, []);

    const handleChange = async (e : any) => {
        const newValue = e.target.checked;
        setIsRagEnabled(newValue);
        await SetUseBot(newValue);
    };


    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 pb-12">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    ИИ помощник
                </h3>
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isRagEnabled}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}