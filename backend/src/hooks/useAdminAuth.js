import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Decode JWT token manually (không cần thư viện)
 */
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

/**
 * Hook để protect admin routes phía client
 * Dùng cho Vercel deployment khi token lưu trong localStorage
 */
export const useAdminAuth = () => {
    const router = useRouter();

    useEffect(() => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Không có token → redirect về home
            console.log('❌ No token found, redirecting to home');
            router.replace('/');
            return;
        }

        try {
            // Decode JWT để lấy role
            const decoded = decodeJWT(token);
            
            if (!decoded) {
                throw new Error('Invalid token');
            }
            
            const role = decoded.role;
            console.log('🔐 User role:', role);

            // Nếu không phải admin → redirect về home
            if (role !== 'admin') {
                console.log('❌ User is not admin, redirecting to home');
                router.replace('/');
            } else {
                console.log('✅ Admin access granted');
            }
        } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
            router.replace('/');
        }
    }, [router]);
};

export default useAdminAuth;
