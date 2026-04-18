'use client'
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth', {
                    credentials: 'include',
                });
                if (response.ok) {
                    router.replace('/operator');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    async function onAuth() {
        if (!token) {
            setError("Введите токен");
            return;
        }

        setIsAuthSubmitting(true);
        setError("");

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                setError("Введен неправильный токен");
                setIsAuthSubmitting(false);
                return;
            }

            const data = await response.json();
            router.replace('/operator');
        } catch (error) {
            setError("Ошибка при авторизации");
            console.error('Auth error:', error);
            setIsAuthSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="mx-auto my-auto">
            <div className="mx-auto my-auto w-[800px]">
                <div className="text-center text-error my-4 font-bold">
                    {error}
                </div>
                <form onSubmit={e => e.preventDefault()}>
                    <div className="flex flex-row gap-4">
                        <Button type="button" onClick={() => router.replace('/')}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                <path d="M640-200 200-480l440-280v560Zm-80-280Zm0 134v-268L350-480l210 134Z" />
                            </svg> Назад
                        </Button>
                        <input
                            className="input h-16 flex-1"
                            placeholder="Введите токен доступа"
                            value={token}
                            onChange={(event) => {
                                setToken(event.target.value);
                                setError("");
                            }}
                            disabled={isAuthSubmitting}
                        />
                        <Button onClick={onAuth} disabled={isAuthSubmitting}>
                            {isAuthSubmitting ? 'Вход...' : 'Вход'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="flex flex-row justify-center mt-16">
            </div>
        </div>
    );
}