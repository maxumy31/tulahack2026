'use client'

import { useRouter } from 'next/navigation';
import OperatorHeader from '../../components/OperatorHeader';
import DashboardContent from './DashboardContent';

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

interface DashboardLayoutProps {
    initialStats: TicketStats;
    initialChartData: Record<string, ChartDataPoint[]>;
}

export default function DashboardLayout({ initialStats, initialChartData }: DashboardLayoutProps) {
    const router = useRouter();

    const handleTabClick = (tab: string) => {
        if (tab === 'Чат') {
            router.push('/operator');
        }
    };

    return (
        <div className="min-h-screen bg-base-100">
            <OperatorHeader
                headers={["Чат", "Статистика"]}
                activeHeader="Статистика"
                onTabClick={handleTabClick}
            />
            <div className="max-w-7xl mx-auto">
                <DashboardContent 
                    initialStats={initialStats} 
                    initialChartData={initialChartData} 
                />
            </div>
        </div>
    );
}
