'use client'

interface ChartCardProps {
    title: string;
    id: string;
    data: Array<{ hour: number; tickets: number }>;
}

export default function ChartCard({ title, id, data }: ChartCardProps) {
    const maxTickets = Math.max(...data.map(d => d.tickets));
    const chartHeight = 250;

    return (
        <div id={id} className="bg-white rounded-lg border border-gray-200 p-6 scroll-mt-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
            
            <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: '1000px' }}>
                    {/* Y-axis */}
                    <div className="flex flex-col justify-between text-xs text-gray-500 pr-3 w-10 flex-shrink-0" style={{ height: `${chartHeight}px` }}>
                        <div>{maxTickets}</div>
                        <div>{Math.round(maxTickets * 0.5)}</div>
                        <div>0</div>
                    </div>

                    {/* Chart area */}
                    <div className="flex-1 relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between border-l border-gray-200">
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="border-t border-gray-200 w-full"></div>
                            <div className="border-t border-gray-200 w-full"></div>
                        </div>

                        {/* Bars */}
                        <div className="relative flex items-end justify-around gap-0.5 h-full">
                            {data.map((point) => {
                                const barHeight = (point.tickets / maxTickets) * chartHeight;
                                return (
                                    <div key={point.hour} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-primary rounded-t hover:opacity-80 transition-opacity"
                                            style={{
                                                height: `${barHeight}px`,
                                                minWidth: '100%',
                                                minHeight: point.tickets > 0 ? '2px' : '0px'
                                            }}
                                            title={`${point.hour}:00 - ${point.tickets} заявок`}
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
                        {data.map((point) => (
                            point.hour % 3 === 0 && (
                                <div key={point.hour} className="flex-1 text-center text-xs text-gray-500">
                                    {point.hour}:00
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <div className="text-gray-600 mb-1">Пик</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {Math.max(...data.map(d => d.tickets))} заявок
                    </div>
                </div>
                <div>
                    <div className="text-gray-600 mb-1">Среднее</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {Math.round(data.reduce((sum, d) => sum + d.tickets, 0) / data.length)} заявок
                    </div>
                </div>
                <div>
                    <div className="text-gray-600 mb-1">Всего</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {data.reduce((sum, d) => sum + d.tickets, 0)} заявок
                    </div>
                </div>
            </div>
        </div>
    );
}
