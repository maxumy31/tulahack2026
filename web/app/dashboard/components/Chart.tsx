'use client'

interface ChartProps {
    xLabels: (string | number)[];
    yValues: number[];
}

export default function Chart({ xLabels, yValues }: ChartProps) {
    // Объединяем массивы для удобства обработки
    const data = xLabels.map((label, index) => ({
        label,
        value: yValues[index] || 0
    }));

    const maxTickets = Math.max(...yValues, 0);
    const chartHeight = 250;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Активность</h2>
            
            <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: '600px' }}>
                    {/* Ось Y */}
                    <div className="flex flex-col justify-between text-xs text-gray-500 pr-3 w-10 flex-shrink-0" style={{ height: `${chartHeight}px` }}>
                        <div>{maxTickets}</div>
                        <div>{Math.round(maxTickets * 0.5)}</div>
                        <div>0</div>
                    </div>

                    {/* График */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col justify-between border-l border-gray-200">
                            {[...Array(3)].map((_, i) => <div key={i} className="border-t border-gray-200 w-full"></div>)}
                        </div>
                        <div className="relative flex items-end justify-around gap-0.5 h-full">
                            {data.map((item, index) => {
                                const barHeight = maxTickets > 0 ? (item.value / maxTickets) * chartHeight : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                            style={{
                                                height: `${barHeight}px`,
                                                minHeight: item.value > 0 ? '2px' : '0px'
                                            }}
                                            title={`${item.label}: ${item.value}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Ось X */}
                <div className="flex gap-1 mt-2 ml-10">
                    <div className="flex items-start justify-around w-full">
                        {data.map((item, index) => (
                            // Показываем подпись только для каждого 3-го элемента, чтобы не теснились
                            index % 3 === 0 && (
                                <div key={index} className="flex-1 text-center text-xs text-gray-500">
                                    {item.label}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}