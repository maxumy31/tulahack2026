import { GetTicketStats, type TicketStats } from './State';

async function GenerateReport(date?: Date): Promise<string> {
    try {
        const stats = await GetTicketStats(date);
        
        const reportDate = date ? new Date(date).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU');
        
        const report = `Отчёт о заявках
================
Дата: ${reportDate}

Статистика по заявкам:
* Открыто передано человеку: ${stats.openedHuman}
* Открыто обрабатывается ботом: ${stats.openedBot}
* Закрыто передано человеку: ${stats.closedHuman}
* Закрыто обрабатывается ботом: ${stats.closedBot}

Итого:
* Всего открыто: ${stats.openedHuman + stats.openedBot}
* Всего закрыто: ${stats.closedHuman + stats.closedBot}
* Всего заявок: ${stats.openedHuman + stats.openedBot + stats.closedHuman + stats.closedBot}`;

        return report;
    } catch (error) {
        console.error('Error generating report:', error);
        return 'Ошибка при генерации отчёта';
    }
}

export { GenerateReport };
