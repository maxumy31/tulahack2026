interface StatsCardProps {
    count: number;
    title: string;
    onClick?: () => void;
}

export default function StatsCard({ count, title, onClick }: StatsCardProps) {


    return (
        <button
            onClick={onClick}
            className="p-5 rounded-lg bg-white text-left"
        >
            <div className="text-sm font-medium text-gray-600 mb-3">
                {title}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
                {count}
            </div>
        </button>
    );
}
