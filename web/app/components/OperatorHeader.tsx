'use client'

import Button from "./Button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Определяем соответствие имен путям
const PATH_MAP: Record<string, string> = {
    "Чат": "/operator",
    "Статистика": "/dashboard",
};

export default function OperatorHeader({
    headers,
    activeHeader,
}: {
    headers: string[],
    activeHeader: string,
}) {
    const router = useRouter();

    function exit() {
        Cookies.remove("token");
        router.push("/");
    }

    return (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center py-4 bg-base-100 px-4 sticky top-0 z-50">
            <div />

            <div className="flex gap-16">
                {headers.map((header) => (
                    <div
                        key={header}
                        // Используем внутренний маппинг для навигации
                        onClick={() => router.push(PATH_MAP[header] || "/")}
                        className={`cursor-pointer transition duration-300 font-medium text-[16px] leading-[20px] 
                        ${header === activeHeader
                                ? "underline underline-offset-[12px] decoration-primary decoration-2"
                                : "hover:underline hover:underline-offset-[12px] hover:decoration-primary/50 decoration-transparent transition-all"}`}
                    >
                        {header}
                    </div>
                ))}
            </div>

            <div className="flex justify-end px-64">
                <Button size="md" onClick={exit}>Выход</Button>
            </div>
        </header>
    );
}