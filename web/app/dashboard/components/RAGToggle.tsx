'use client'

import { useState, useEffect } from 'react';
import { GetUseBot, SetUseBot } from '@/server/State';

export default function RAGToggle() {
    const [isRagEnabled, setIsRagEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBotStatus = async () => {
            try {
                const status = await GetUseBot();
                setIsRagEnabled(status);
            } catch (error) {
                console.error('Failed to fetch bot status:', error);
            }
        };
        fetchBotStatus();
    }, []);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    ИИ помощник
                </h3>
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isRagEnabled}
                    onChange={async (e) => {
                        const newValue = e.target.checked;
                        setIsLoading(true);
                        try {
                            await SetUseBot(newValue);
                            setIsRagEnabled(newValue);
                        } catch (error) {
                            console.error('Failed to update bot status:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
