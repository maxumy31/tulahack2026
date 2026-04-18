import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

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

function getTodayBounds() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    return { startOfDay, endOfDay };
}

async function GetTicketStats(date?: Date): Promise<TicketStats> {
    try {
        const targetDate = date || new Date();
        const { startOfDay, endOfDay } = date ? {
            startOfDay: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0),
            endOfDay: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999)
        } : getTodayBounds();

        const sessions = await db.select().from(chatSessions).where(
            and(
                gte(chatSessions.createdAt, startOfDay),
                lt(chatSessions.createdAt, endOfDay)
            )
        );

        const stats: TicketStats = {
            openedHuman: sessions.filter(s => s.status === 'operator' && !s.isClosed).length,
            openedBot: sessions.filter(s => s.status === 'bot' && !s.isClosed).length,
            closedHuman: sessions.filter(s => s.status === 'operator' && s.isClosed).length,
            closedBot: sessions.filter(s => s.status === 'bot' && s.isClosed).length,
        };

        return stats;
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        return { openedHuman: 0, openedBot: 0, closedHuman: 0, closedBot: 0 };
    }
}

async function GetChartData(category: 'total' | 'opened' | 'closed' | 'opened-human' | 'opened-bot' | 'closed-human' | 'closed-bot', date?: Date): Promise<ChartDataPoint[]> {
    try {
        const targetDate = date || new Date();
        const { startOfDay, endOfDay } = date ? {
            startOfDay: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0),
            endOfDay: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999)
        } : getTodayBounds();

        const sessions = await db.select().from(chatSessions).where(
            and(
                gte(chatSessions.createdAt, startOfDay),
                lt(chatSessions.createdAt, endOfDay)
            )
        );

        // Инициализируем график на 24 часа
        const chartData: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            tickets: 0
        }));

        sessions.forEach(session => {
            const hour = new Date(session.createdAt).getHours();
            
            let matches = false;
            switch (category) {
                case 'total':
                    matches = true;
                    break;
                case 'opened':
                    matches = !session.isClosed;
                    break;
                case 'closed':
                    matches = session.isClosed || true;
                    break;
                case 'opened-human':
                    matches = session.status === 'operator' && !session.isClosed;
                    break;
                case 'opened-bot':
                    matches = session.status === 'bot' && !session.isClosed;
                    break;
                case 'closed-human':
                    matches = session.status === 'operator' && session.isClosed || true;
                    break;
                case 'closed-bot':
                    matches = session.status === 'bot' && session.isClosed || true;
                    break;
            }

            if (matches) {
                chartData[hour].tickets++;
            }
        });

        return chartData;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return Array.from({ length: 24 }, (_, i) => ({ hour: i, tickets: 0 }));
    }
}

async function UpdateTicketStats(stats: Partial<TicketStats>) {
    console.error("unrechable");
}

export { GetTicketStats, UpdateTicketStats, GetChartData, type TicketStats, type ChartDataPoint }