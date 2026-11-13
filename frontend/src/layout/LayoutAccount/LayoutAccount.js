import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import LayoutUser from '../LayoutUser/LayoutUser';
import useAuthGuard from '@/hooks/useAuthGuard';
import { PATH } from '@/constants/config';
import style from './LayoutAccount.module.scss';

const TABS = [
    { path: PATH.Overview, label: 'Tổng quan' },
    { path: PATH.InvoiceDetail, label: 'Lịch sử đặt phòng' },
    { path: PATH.Account, label: 'Tài khoản' },
];

/** Trang tài khoản: cần đăng nhập, có thanh tab chung. */
const LayoutAccount = ({ title, children }) => {
    const { pathname } = useRouter();
    const allowed = useAuthGuard();

    return (
        <LayoutUser>
            <div className={style.page}>
                <h1>{title}</h1>
                <nav aria-label="Tài khoản" className={style.tabs}>
                    {TABS.map(({ path, label }) => (
                        <Link
                            key={path}
                            href={path}
                            aria-current={pathname === path ? 'page' : undefined}
                            className={clsx(style.tab, pathname === path && style.active)}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                {allowed ? children : <p className={style.muted}>Đang kiểm tra đăng nhập…</p>}
            </div>
        </LayoutUser>
    );
};

export default LayoutAccount;
