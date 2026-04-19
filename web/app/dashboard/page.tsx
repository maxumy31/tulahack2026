import OperatorHeader from '../components/OperatorHeader';
import {
    CountAllClosedSessions,
    CountAllOpenSessions,
    CountAllSessions,
    GetAverageChatLength,
    GetBotFailureRate,
    GetBotResolvedDistribution as GetBotResolvedDistribution,
    GetClosingStats,
    GetComplexityDistribution as GetComplexityDistribution,
    GetDailyClosedSessionsCount,
    GetDailyCreatedSessionsCount,
    GetMessageCountDistribution
} from '@/server/Chart';
import StatusPieChart from './components/StatusPieChart';
import StatsCard from './components/StatsCard';
import RAGToggle from './components/RAGToggle';
import GenerateReportButton from './components/GenerateReportButton';
import { redirect } from 'next/navigation';
import ChartCard from './components/ChartCard';

export default async function DashboardPage() {
    const [
        totalTickets,
        openTickets,
        closedTickets,
        humanBotClosedTickets,
        closedDistributionByMessages,
        openedTicketsPerDay,
        closedTicketsPerDay,
        avgChatLength,
        complexityDistribution,
        botComplexityDistribution,
        botFailedPercent,
    ] = await Promise.all([
        CountAllSessions(),
        CountAllOpenSessions(),
        CountAllClosedSessions(),
        GetClosingStats(),
        GetMessageCountDistribution(),
        GetDailyCreatedSessionsCount(),
        GetDailyClosedSessionsCount(),
        GetAverageChatLength(),
        GetComplexityDistribution(),
        GetBotResolvedDistribution(),
        GetBotFailureRate(),
    ]);

    return (
        <div className="min-h-screen bg-base-100">
            <OperatorHeader
                headers={["Чат", "Статистика"]}
                activeHeader="Статистика"
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <StatsCard count={openedTicketsPerDay} title="Поступило заявок за день" />
                                <StatsCard count={closedTicketsPerDay} title="Закрыто заявок за день" />
                                <StatsCard count={Number(avgChatLength)} title="Средняя длина чата" />
                            </div>

                        </div>

                    </div>

                    <div className="lg:col-span-1 space-y-2 flex flex-col justify-between">
                        <RAGToggle />
                        <GenerateReportButton />
                    </div>


                </div>

                <div className="mt-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full h-[350px]">
                        <StatusPieChart
                            title="Соотношение заявок закрытых ИИ и оператором"
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
                            title="Распределение задач по тому, смог ли их решить ИИ"
                            data={
                                [
                                    {
                                        "name": "Решено ИИ",
                                        "value": (100 - botFailedPercent),
                                        "color": "#0A69AF"
                                    },
                                    {
                                        "name": "ИИ не смог решить",
                                        "value": botFailedPercent,
                                        "color": "#b8b8b8"
                                    }
                                ]
                            } />
                    </div>
                    <div>
                        <StatusPieChart
                            title="Распределение задач по сложности"
                            data={
                                complexityDistribution ?
                                    complexityDistribution.map((tkt, ind) => {
                                        return {
                                            "name": String(tkt.complexity || "0"),
                                            "value": tkt.count || 0,
                                            color: ind % 2 == 0 ? "#0A69AF" : "#b8b8b8"
                                        }
                                    }) : []
                            } />
                    </div>

                </div>
                <div className="mt-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">


                    <div>
                        <ChartCard title="Распределение задач, решенных ИИ, по сложности" id="123"
                            labels={botComplexityDistribution.map(tkt => tkt.complexity || 0)}
                            values={botComplexityDistribution.map(tkt => tkt.count || 0)}
                        />
                    </div>
                    <div>
                        <ChartCard title="Распределение задач по количеству сообщений" id="123"
                            labels={closedDistributionByMessages.map(msg => msg.label)}
                            values={closedDistributionByMessages.map(msg => msg.value)}
                        />
                    </div>
                </div>


            </div>
        </div>
    );
}
