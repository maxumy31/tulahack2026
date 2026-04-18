'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from './components/StatsCard';
import RAGToggle from './components/RAGToggle';
import GenerateReportButton from './components/GenerateReportButton';
import ChartCard from './components/ChartCard';
import { GetTicketStats, type TicketStats } from '@/server/State';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await GetTicketStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    // Mock data generators
    const generateChartData = (baseValue: number) => {
        return Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            tickets: Math.max(0, Math.round(
                baseValue * Math.sin((i - 6) * Math.PI / 12) * 0.7 +
                Math.random() * baseValue * 0.3
            ))
        }));
    };

    const totalTickets = stats ? stats.openedHuman + stats.openedBot + stats.closedHuman + stats.closedBot : 0;
    const openedTickets = stats ? stats.openedHuman + stats.openedBot : 0;
    const closedTickets = stats ? stats.closedHuman + stats.closedBot : 0;

    return (
        <div className="min-h-screen bg-base-300">
            <div className="flex flex-row justify-center gap-16 py-1 bg-base-100 border-b">
                <div className="px-8 py-3 text-black underline">
                    Чат
                </div>
                <div
                    className="px-8 py-3 text-black hover:underline transition duration-500"
                >
                    Статистика
                </div>
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
                    </div>
                    <p className="text-gray-600 ml-11">Статистика по заявкам и управление режимом обработки</p>
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

                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : stats ? (
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
                            ) : null}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <RAGToggle />
                        <GenerateReportButton />
                    </div>
                </div>

                {/* Chart Section */}
                <div className="mt-8 space-y-8 mb-4">
                    <ChartCard
                        title="Всего заявок"
                        id="chart-total"
                        data={generateChartData(totalTickets)}
                    />
                    <ChartCard
                        title="Всего открыто"
                        id="chart-opened"
                        data={generateChartData(openedTickets)}
                    />
                    <ChartCard
                        title="Всего закрыто"
                        id="chart-closed"
                        data={generateChartData(closedTickets)}
                    />
                    <ChartCard
                        title="Открыта — передано человеку"
                        id="chart-opened-human"
                        data={generateChartData(stats?.openedHuman || 0)}
                    />
                    <ChartCard
                        title="Открыта — обрабатывается ботом"
                        id="chart-opened-bot"
                        data={generateChartData(stats?.openedBot || 0)}
                    />
                    <ChartCard
                        title="Закрыта — передано человеку"
                        id="chart-closed-human"
                        data={generateChartData(stats?.closedHuman || 0)}
                    />
                    <ChartCard
                        title="Закрыта — обрабатывается ботом"
                        id="chart-closed-bot"
                        data={generateChartData(stats?.closedBot || 0)}
                    />
                </div>
            </div>
        </div>
    );
}
