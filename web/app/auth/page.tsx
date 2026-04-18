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
        <div className="mx-auto my-auto w-[400px]">
            <div className="text-center text-error my-4 font-bold">
                {error}
            </div>
            <div className="flex flex-row gap-4">
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
        </div>
    );
}