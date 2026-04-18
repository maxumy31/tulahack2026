'use client'

import { useState, useEffect } from 'react';

export default function RAGToggle() {
    const [isRagEnabled, setIsRagEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBotStatus = async () => {
            try {
                const response = await fetch('/api/bot');
                if (!response.ok) throw new Error('Failed to fetch bot status');
                const data = await response.json();
                setIsRagEnabled(data.useBot);
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
                            const response = await fetch('/api/bot', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ useBot: newValue })
                            });
                            if (!response.ok) throw new Error('Failed to update bot status');
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
