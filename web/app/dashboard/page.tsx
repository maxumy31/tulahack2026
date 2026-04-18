import { GetTicketStats, GetChartData } from '@/server/State';
import { verifyTokenFromCookie } from '@/server/OperatorAuth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';

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

export default async function DashboardPage() {
    // Проверка авторизации на сервере
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/auth');
    }

    const operator = await verifyTokenFromCookie(token);
    if (!operator) {
        redirect('/auth');
    }

    // Получаем данные на сервере
    const stats = await GetTicketStats();
    
    const categories = ['total', 'opened', 'closed', 'opened-human', 'opened-bot', 'closed-human', 'closed-bot'];
    const chartData: Record<string, ChartDataPoint[]> = {};

    for (const category of categories) {
        chartData[category] = await GetChartData(category as any);
    }

    return (
        <DashboardLayout 
            initialStats={stats} 
            initialChartData={chartData} 
        />
    );
}
