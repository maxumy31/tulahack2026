'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Operator {
    id: string;
    token: string;
    fullName: string;
}

interface UseAuthReturn {
    isLoading: boolean;
    isAuthenticated: boolean;
    operator: Operator | null;
    error: string | null;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    setIsAuthenticated(false);
                    setOperator(null);
                    setIsLoading(false);
                    router.replace('/auth');
                    return;
                }

                const data = await response.json();

                if (data.authenticated && data.operator) {
                    setIsAuthenticated(true);
                    setOperator(data.operator);
                } else {
                    setIsAuthenticated(false);
                    setOperator(null);
                    router.replace('/auth');
                }
            } catch (err) {
                console.error('Auth check error:', err);
                setError('Failed to verify authentication');
                setIsAuthenticated(false);
                setOperator(null);
                router.replace('/auth');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    return { isLoading, isAuthenticated, operator, error };
}
