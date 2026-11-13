import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserData } from '@/services/account';
import { PATH } from '@/constants/config';

/**
 * Chặn trang theo đăng nhập/quyền (dựa trên /account/data do server xác thực).
 * role = undefined: chỉ cần đăng nhập; role = 'admin': phải là admin.
 * Trả về true khi đã được phép hiển thị.
 */
export const useAuthGuard = (role) => {
    const router = useRouter();
    const { user, isLoading } = useUserData();
    const allowed = !!user && (!role || user.role === role);

    useEffect(() => {
        if (isLoading || allowed) return;
        router.replace(user ? PATH.Home : PATH.Login);
    }, [isLoading, allowed, user, router]);

    return allowed;
};

export default useAuthGuard;
