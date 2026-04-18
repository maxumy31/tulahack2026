'use client'

export default function Chart() {
    // Mock данные: заявки по часам (0-23)
    const hourlyData = [
        { hour: 0, tickets: 2 },
        { hour: 1, tickets: 1 },
        { hour: 2, tickets: 0 },
        { hour: 3, tickets: 1 },
        { hour: 4, tickets: 0 },
        { hour: 5, tickets: 2 },
        { hour: 6, tickets: 5 },
        { hour: 7, tickets: 8 },
        { hour: 8, tickets: 12 },
        { hour: 9, tickets: 15 },
        { hour: 10, tickets: 18 },
        { hour: 11, tickets: 14 },
        { hour: 12, tickets: 16 },
        { hour: 13, tickets: 19 },
        { hour: 14, tickets: 17 },
        { hour: 15, tickets: 20 },
        { hour: 16, tickets: 18 },
        { hour: 17, tickets: 22 },
        { hour: 18, tickets: 19 },
        { hour: 19, tickets: 15 },
        { hour: 20, tickets: 12 },
        { hour: 21, tickets: 9 },
        { hour: 22, tickets: 6 },
        { hour: 23, tickets: 3 },
    ];

    const maxTickets = Math.max(...hourlyData.map(d => d.tickets));
    const chartHeight = 250;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Активность по часам</h2>
            
            <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: '1000px' }}>
                    <div className="flex flex-col justify-between text-xs text-gray-500 pr-3 w-10 flex-shrink-0" style={{ height: `${chartHeight}px` }}>
                        <div>{maxTickets}</div>
                        <div>{Math.round(maxTickets * 0.5)}</div>
                        <div>0</div>
                    </div>

                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col justify-between border-l border-gray-200">
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="border-t border-gray-200 w-full"></div>
                        </div>
                        <div className="relative flex items-end justify-around gap-0.5 h-full">
                            {hourlyData.map((data) => {
                                const barHeight = (data.tickets / maxTickets) * chartHeight;
                                return (
                                    <div key={data.hour} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-primary rounded-t hover:opacity-80 transition-opacity"
                                            style={{
                                                height: `${barHeight}px`,
                                                minWidth: '100%',
                                                minHeight: data.tickets > 0 ? '2px' : '0px'
                                            }}
                                            title={`${data.hour}:00 - ${data.tickets} заявок`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* X-axis */}
                <div className="flex gap-1 mt-2 ml-10">
                    <div className="flex-1"></div>
                    <div className="flex items-start justify-around w-full">
                        {hourlyData.map((data) => (
                            data.hour % 3 === 0 && (
                                <div key={data.hour} className="flex-1 text-center text-xs text-gray-500">
                                    {data.hour}:00
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <div className="text-gray-600 mb-1">Пик активности</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {Math.max(...hourlyData.map(d => d.tickets))} заявок
                    </div>
                </div>
                <div>
                    <div className="text-gray-600 mb-1">Среднее в час</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {Math.round(hourlyData.reduce((sum, d) => sum + d.tickets, 0) / hourlyData.length)} заявок
                    </div>
                </div>
                <div>
                    <div className="text-gray-600 mb-1">Всего за день</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {hourlyData.reduce((sum, d) => sum + d.tickets, 0)} заявок
                    </div>
                </div>
            </div>
        </div>
    );
}
