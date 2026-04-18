'use client'

import { useState, useEffect, useRef } from 'react';
import { getTicketStats, getChartData } from '../actions';
import StatsCard from './StatsCard';
import RAGToggle from './RAGToggle';
import GenerateReportButton from './GenerateReportButton';
import ChartCard from './ChartCard';

interface TicketStats {
    openedHuman: number;
    openedBot: number;
    closedHuman: number;
    closedBot: number;
}

interface ChartDataPoint {
    hour: number;
    tickets: number;
}

interface DashboardContentProps {
    initialStats: TicketStats;
    initialChartData: Record<string, ChartDataPoint[]>;
}

export default function DashboardContent({ initialStats, initialChartData }: DashboardContentProps) {
    const [stats, setStats] = useState<TicketStats>(initialStats);
    const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>(initialChartData);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Функция для получения данных
    const fetchData = async () => {
        try {
            const statsData = await getTicketStats();
            setStats(statsData);

            const categories = ['total', 'opened', 'closed', 'opened-human', 'opened-bot', 'closed-human', 'closed-bot'];
            const data: Record<string, ChartDataPoint[]> = {};

            for (const category of categories) {
                data[category] = await getChartData(category as any);
            }

            setChartData(data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    // Настройка long polling
    useEffect(() => {
        // Initial fetch already done, now set up polling
        pollIntervalRef.current = setInterval(fetchData, 5000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const totalTickets = stats.openedHuman + stats.openedBot + stats.closedHuman + stats.closedBot;
    const openedTickets = stats.openedHuman + stats.openedBot;
    const closedTickets = stats.closedHuman + stats.closedBot;

    return (
        <>
            <div className="mb-10 pt-4">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => handleScroll('chart-total')}
                    className="bg-primary rounded-lg p-6 text-left hover:opacity-90 transition-opacity"
                >
                    <div className="text-sm font-medium text-primary-content mb-2 opacity-90">Всего заявок</div>
                    <div className="text-3xl font-bold text-primary-content">{totalTickets}</div>
                </button>
                <button
                    onClick={() => handleScroll('chart-opened')}
                    className="bg-primary rounded-lg p-6 text-left hover:opacity-90 transition-opacity"
                >
                    <div className="text-sm font-medium text-primary-content mb-2 opacity-90">Открыто</div>
                    <div className="text-3xl font-bold text-primary-content">{openedTickets}</div>
                </button>
                <button
                    onClick={() => handleScroll('chart-closed')}
                    className="bg-primary rounded-lg p-6 text-left hover:opacity-90 transition-opacity"
                >
                    <div className="text-sm font-medium text-primary-content mb-2 opacity-90">Закрыто</div>
                    <div className="text-3xl font-bold text-primary-content">{closedTickets}</div>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Детальная статистика</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatsCard
                                count={stats.openedHuman}
                                statusType="opened-human"
                                onClick={() => handleScroll('chart-opened-human')}
                            />
                            <StatsCard
                                count={stats.openedBot}
                                statusType="opened-bot"
                                onClick={() => handleScroll('chart-opened-bot')}
                            />
                            <StatsCard
                                count={stats.closedHuman}
                                statusType="closed-human"
                                onClick={() => handleScroll('chart-closed-human')}
                            />
                            <StatsCard
                                count={stats.closedBot}
                                statusType="closed-bot"
                                onClick={() => handleScroll('chart-closed-bot')}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <RAGToggle />
                    <GenerateReportButton />
                </div>
            </div>

            <div className="mt-8 space-y-8 mb-4">
                <ChartCard
                    title="Всего заявок"
                    id="chart-total"
                    data={chartData['total'] || []}
                />
                <ChartCard
                    title="Всего открыто"
                    id="chart-opened"
                    data={chartData['opened'] || []}
                />
                <ChartCard
                    title="Всего закрыто"
                    id="chart-closed"
                    data={chartData['closed'] || []}
                />
                <ChartCard
                    title="Открыта — передано человеку"
                    id="chart-opened-human"
                    data={chartData['opened-human'] || []}
                />
                <ChartCard
                    title="Открыта — обрабатывается ботом"
                    id="chart-opened-bot"
                    data={chartData['opened-bot'] || []}
                />
                <ChartCard
                    title="Закрыта — передано человеку"
                    id="chart-closed-human"
                    data={chartData['closed-human'] || []}
                />
                <ChartCard
                    title="Закрыта — обрабатывается ботом"
                    id="chart-closed-bot"
                    data={chartData['closed-bot'] || []}
                />
            </div>
        </>
    );
}
