'use client'

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useLogout() {
    const router = useRouter();

    const logout = useCallback(async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
            });

            if (response.ok) {
                router.push('/auth');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [router]);

    return logout;
}
