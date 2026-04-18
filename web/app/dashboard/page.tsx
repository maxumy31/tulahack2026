'use client'

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import RAGToggle from './components/RAGToggle';
import GenerateReportButton from './components/GenerateReportButton';
import OperatorHeader from '../components/OperatorHeader';
import { CountAllClosedSessions, CountAllOpenSessions, CountAllSessions, GetClosingStats, GetMessageCountDistribution } from '@/server/Chart';
import StatusPieChart from './components/StatusPieChart';


export default function DashboardPage() {
    const [totalTickets, setTotalTickets] = useState<number>(0);
    const [openTickets, setOpenTickets] = useState<number>(0);
    const [closedTickets, setClosedTickets] = useState<number>(0);

    const [humanBotClosedTickets, sethumanBotClosedTickets] = useState<{
        label: string,
        value: number
    }[]>()

    const [closedDistributionByMessages, setClosedDistributionByMessages] = useState<{
        label: string,
        value: number
    }[]>();

    async function SyncData() {
        const currentTotalTickets = await CountAllSessions() || 0;
        const currentOpenTickets = await CountAllOpenSessions() || 0;
        const currentClosedTickets = await CountAllClosedSessions() || 0;

        setTotalTickets(currentTotalTickets);
        setOpenTickets(currentOpenTickets);
        setClosedTickets(currentClosedTickets);

        const humanBotClosedTickets = await GetClosingStats();
        sethumanBotClosedTickets(humanBotClosedTickets);

        const closedDistributionByMessages = await GetMessageCountDistribution();
        setClosedDistributionByMessages(closedDistributionByMessages);
    }

    useEffect(() => {
        SyncData();
    }, [])

    return (
        <div className="min-h-screen bg-base-100">
            <OperatorHeader
                headers={["Чат", "Статистика"]}
                activeHeader="Статистика"
                onTabClick={(tab) => { redirect("/operator"); }}
            />
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button

                        className="bg-primary rounded-lg p-6 text-left hover:opacity-90 transition-opacity"
                    >
                        <div className="text-sm font-medium text-primary-content mb-2 opacity-90">Всего заявок</div>
                        <div className="text-3xl font-bold text-primary-content">{totalTickets}</div>
                    </button>
                    <button

                        className="bg-primary rounded-lg p-6 text-left hover:opacity-90 transition-opacity"
                    >
                        <div className="text-sm font-medium text-primary-content mb-2 opacity-90">Открыто</div>
                        <div className="text-3xl font-bold text-primary-content">{openTickets}</div>
                    </button>
                    <button

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


                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <RAGToggle />
                        <GenerateReportButton />
                    </div>
                </div>

                <div className="mt-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full h-[350px]"> {/* Фиксируем высоту здесь */}
                        <StatusPieChart
                            title="Соотношение заявок закрытых ботом и оператором"
                            data={
                                humanBotClosedTickets ?
                                    humanBotClosedTickets.map((tkt) => {
                                        return {
                                            name: tkt.label === "operator" ? "Оператор" : "ИИ",
                                            value: tkt.value,
                                            color: tkt.label === "operator" ? "#0A69AF" : "#b8b8b8"
                                        }
                                    })
                                    : []
                            } />
                    </div>
                    <div>
                        <StatusPieChart
                            title="Распределение решенных задач по количеству сообщений"
                            data={
                                closedDistributionByMessages ?
                                    closedDistributionByMessages.map((tkt, ind) => {
                                        return {
                                            name: tkt.label,
                                            value: tkt.value,
                                            color: ind % 2 == 0 ? "#0A69AF" : "#b8b8b8"
                                        }
                                    })
                                    : []
                            } />
                    </div>

                </div>
            </div>
        </div>
    );
}
