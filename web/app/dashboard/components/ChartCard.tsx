'use client'

interface ChartCardProps {
    title: string;
    id: string;
    // Принимаем массивы напрямую для максимальной гибкости
    labels: (string | number)[];
    values: number[];
}

export default function ChartCard({ title, id, labels, values }: ChartCardProps) {
    const maxVal = Math.max(...values, 0);
    const chartHeight = 250;
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = values.length > 0 ? Math.round(total / values.length) : 0;

    return (
        <div id={id} className="bg-white rounded-lg border border-gray-200 p-6 scroll-mt-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
            
            <div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: '600px' }}>
                    {/* Ось Y */}
                    <div className="flex flex-col justify-between text-xs text-gray-500 pr-3 w-10 flex-shrink-0" style={{ height: `${chartHeight}px` }}>
                        <div>{maxVal}</div>
                        <div>{Math.round(maxVal * 0.5)}</div>
                        <div>0</div>
                    </div>

                    {/* График */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col justify-between border-l border-gray-200">
                            {[...Array(3)].map((_, i) => <div key={i} className="border-t border-gray-200 w-full" />)}
                        </div>

                        <div className="relative flex items-end justify-around gap-0.5 h-full">
                            {values.map((val, index) => {
                                const barHeight = maxVal > 0 ? (val / maxVal) * chartHeight : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-primary rounded-t hover:opacity-80 transition-opacity"
                                            style={{
                                                height: `${barHeight}px`,
                                                minHeight: val > 0 ? '2px' : '0px'
                                            }}
                                            title={`${labels[index]}: ${val}`}
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
                        {labels.map((label, index) => (
                            index % Math.ceil(labels.length / 8) === 0 && (
                                <div key={index} className="flex-1 text-center text-xs text-gray-500">
                                    {label}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Итоги */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-gray-600 mb-1">Пик</div>
                    <div className="text-lg font-semibold text-gray-900">{maxVal}</div>
                </div>
                <div>
                    <div className="text-gray-600 mb-1">Среднее</div>
                    <div className="text-lg font-semibold text-gray-900">{average}</div>
                </div>
            </div>
        </div>
    );
}