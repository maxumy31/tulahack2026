'use client'

import { useState } from 'react';

export default function GenerateReportButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/report');
            
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const today = new Date();
            const dateStr = today.toLocaleDateString('ru-RU').replace(/\./g, '-');
            link.download = `report-${dateStr}.html`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button 
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full btn btn-primary disabled:loading"
            >
                {isLoading ? 'Генерируется...' : 'Сгенерировать отчёт'}
            </button>
        </div>
    );
}