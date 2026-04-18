interface StatsCardProps {
    count: number;
    statusType: 'opened-human' | 'opened-bot' | 'closed-human' | 'closed-bot';
    onClick?: () => void;
}

export default function StatsCard({ count, statusType, onClick }: StatsCardProps) {
    const getLabel = () => {
        switch (statusType) {
            case 'opened-human':
                return 'Открыта — передано человеку';
            case 'opened-bot':
                return 'Открыта — обрабатывается ботом';
            case 'closed-human':
                return 'Закрыта — передано человеку';
            case 'closed-bot':
                return 'Закрыта — обрабатывается ботом';
        }
    };

    return (
        <button
            onClick={onClick}
            className="p-5 rounded-lg bg-white hover:shadow-md transition-shadow text-left"
        >
            <div className="text-sm font-medium text-gray-600 mb-3">
                {getLabel()}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
                {count}
            </div>
            <div className="text-xs text-gray-500">
                {count} {count % 10 === 1 && count % 100 !== 11 ? 'заявка' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'заявки' : 'заявок'}
            </div>
        </button>
    );
}
