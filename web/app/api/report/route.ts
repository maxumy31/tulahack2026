import { GetTicketStats, GetChartData } from '@/server/State';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const dateParam = request.nextUrl.searchParams.get('date');
        const date = dateParam ? new Date(dateParam) : undefined;
        
        const stats = await GetTicketStats(date);
        
        const categories = ['total', 'opened', 'closed', 'opened-human', 'opened-bot', 'closed-human', 'closed-bot'];
        const chartData: Record<string, any> = {};
        
        for (const category of categories) {
            chartData[category] = await GetChartData(category as any, date);
        }

        const reportDate = date ? new Date(date).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU');
        const totalTickets = stats.openedHuman + stats.openedBot + stats.closedHuman + stats.closedBot;
        const openedTickets = stats.openedHuman + stats.openedBot;
        const closedTickets = stats.closedHuman + stats.closedBot;

        // Генерируем HTML отчёта
        const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отчёт о заявках - ${reportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: #f9fafb;
            padding: 32px 24px;
            color: #111827;
        }
        .container {
            max-width: 1280px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 30px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 14px;
            color: #6b7280;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            padding: 24px;
            border: 1px solid #e5e7eb;
        }
        .card.primary {
            background-color: #0A69AF;
            color: white;
            border: none;
        }
        .card-label {
            font-size: 14px;
            font-weight: 500;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        .card-value {
            font-size: 28px;
            font-weight: 700;
        }
        .stats-section {
            background-color: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
            border: 1px solid #e5e7eb;
        }
        .stats-section h2 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            display: block;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .stat-item:last-child {
            border-bottom: none;
        }
        .stat-label {
            font-weight: 500;
            color: #6b7280;
        }
        .stat-value {
            font-weight: 600;
            color: #0A69AF;
        }
        .chart-section {
            background-color: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
            border: 1px solid #e5e7eb;
        }
        .chart-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .chart-container {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 200px;
            gap: 4px;
            margin-bottom: 16px;
        }
        .chart-bar {
            flex: 1;
            background-color: #0A69AF;
            border-radius: 4px 4px 0 0;
            min-height: 2px;
            position: relative;
        }
        .page-break {
            page-break-after: always;
            margin: 32px 0;
        }
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Отчёт о заявках</h1>
            <p>Дата: ${reportDate}</p>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="card primary">
                <div class="card-label">Всего заявок</div>
                <div class="card-value">${totalTickets}</div>
            </div>
            <div class="card primary">
                <div class="card-label">Открыто</div>
                <div class="card-value">${openedTickets}</div>
            </div>
            <div class="card primary">
                <div class="card-label">Закрыто</div>
                <div class="card-value">${closedTickets}</div>
            </div>
        </div>

        <!-- Detailed Stats -->
        <div class="stats-section">
            <h2>Детальная статистика</h2>
            <div class="stat-item">
                <span class="stat-label">Открыто — передано человеку</span>
                <span class="stat-value">${stats.openedHuman}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Открыто — обрабатывается ботом</span>
                <span class="stat-value">${stats.openedBot}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Закрыто — передано человеку</span>
                <span class="stat-value">${stats.closedHuman}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Закрыто — обрабатывается ботом</span>
                <span class="stat-value">${stats.closedBot}</span>
            </div>
        </div>

        <!-- Charts -->
        ${['total', 'opened', 'closed', 'opened-human', 'opened-bot', 'closed-human', 'closed-bot'].map((category, idx) => {
            const data = chartData[category];
            const maxTickets = Math.max(...data.map((d: any) => d.tickets), 1);
            const titles: Record<string, string> = {
                'total': 'Всего заявок',
                'opened': 'Всего открыто',
                'closed': 'Всего закрыто',
                'opened-human': 'Открыто — передано человеку',
                'opened-bot': 'Открыто — обрабатывается ботом',
                'closed-human': 'Закрыто — передано человеку',
                'closed-bot': 'Закрыто — обрабатывается ботом'
            };
            return `
            <div class="chart-section">
                <div class="chart-title">${titles[category]}</div>
                <div class="chart-container">
                    ${data.map((point: any) => {
                        const height = (point.tickets / maxTickets) * 100;
                        return `<div class="chart-bar" style="height: ${height}%;" title="Час ${point.hour}: ${point.tickets} заявок"></div>`;
                    }).join('')}
                </div>
                <div style="font-size: 12px; color: #9ca3af; text-align: center;">24-часовое распределение заявок</div>
            </div>
            ${idx % 3 === 2 ? '<div class="page-break"></div>' : ''}
            `;
        }).join('')}
    </div>
</body>
</html>
        `;
        
        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html;charset=utf-8',
                'Content-Disposition': `attachment; filename="report-${reportDate.replace(/\./g, '-')}.html"`,
            },
        });
    } catch (error) {
        console.error('Error in report API:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}